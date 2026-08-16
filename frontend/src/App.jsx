import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouterProvider } from "react-router-dom";

import toast from "react-hot-toast";

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

  // Pre-warm background microservices on mount
  useEffect(() => {
    const preWarmServices = async () => {
      const services = [
        "https://mentorhub-auth-service.onrender.com/health",
        "https://mentorhub-user-service.onrender.com/",
        "https://mentorhub-books-service.onrender.com/",
        "https://mentorhub-mentorship-service.onrender.com/",
        "https://api.mentorhub.devs.surf/"
      ];

      let toastId = null;

      // Show toast if services don't respond in 2 seconds (indicates sleep)
      const timeoutId = setTimeout(() => {
        toastId = toast.loading(
          "Cloud servers are booting up. This may take up to 45 seconds on first load...",
          { duration: 25000 }
        );
      }, 2000);

      try {
        await Promise.all(
          services.map(url => 
            fetch(url, { mode: 'no-cors' }).catch(err => console.log("Warmup ping skipped for", url))
          )
        );
        clearTimeout(timeoutId);
        if (toastId) {
          toast.dismiss(toastId);
          toast.success("All systems online! MentorHub is fully operational.");
        }
      } catch (err) {
        clearTimeout(timeoutId);
        if (toastId) toast.dismiss(toastId);
      }
    };

    preWarmServices();
  }, []);

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

