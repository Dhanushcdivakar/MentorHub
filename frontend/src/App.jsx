import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouterProvider } from "react-router-dom";

import { router } from "./router";
import { getMeApi } from "./api/auth.api";
import { getMyProfileApi } from "./api/user.api";
import { setUserProfile, clearUserProfile } from "./redux/slices/userSlice";
import { clearCredentials } from "./redux/slices/authSlice";
import PageLoader from "./components/PageLoader";

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      if (isAuthenticated) {
        try {
          const response = await getMeApi();
          if (response.success && response.data) {
            let userProfileData = response.data;
            try {
              const profileRes = await getMyProfileApi();
              if (profileRes.success && profileRes.data) {
                userProfileData = { ...userProfileData, ...profileRes.data };
              }
            } catch (profileError) {
              console.error("Failed to restore detailed user profile:", profileError);
            }
            dispatch(setUserProfile(userProfileData));
          }
        } catch (error) {
          console.error("Failed to restore session profile:", error);
          dispatch(clearCredentials());
          dispatch(clearUserProfile());
        }
      }
      setIsInitializing(false);
    };

    restoreSession();
  }, [isAuthenticated, dispatch]);

  if (isInitializing) {
    return <PageLoader />;
  }

  return <RouterProvider router={router} />;
}

export default App;

