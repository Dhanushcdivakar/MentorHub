import app from './app.js';
import { config } from './config/index.js';

app.listen(config.port, () => {
  console.log(`🚀 Gateway running on port ${config.port}`);
  console.log("Resolved Gateway Services Configuration:", config.services);
});
