import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

function navigate(routeName, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(routeName, params);
  }
}

export default { navigate, navigationRef };
