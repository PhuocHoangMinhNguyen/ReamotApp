import React from 'react';
import { createDrawerNavigator } from "react-navigation-drawer";
import BottomTabs from "../BottomTabs";
import DrawerMenu from "./DrawerMenu";

const Drawer = createDrawerNavigator(
    {
        BottomTabs,
    },
    {
        drawerPosition: "right",
        drawerWidth: 250,
        contentComponent: props => <DrawerMenu {...props} />
    }
);

export default Drawer;