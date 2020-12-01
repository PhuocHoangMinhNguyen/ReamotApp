# Reamot

Reamot is a system, which will be developed with the aim to allow both doctors and pharmacists to monitor the medication adherence of their patients. 

Reamot is compromised of a mobile app (compatible with both iOS and Android) for patients to not only be reminded to take their medication but to also log in when they take it, as well as a webpage for doctors and pharmacists to gain access to their patient's habits and adherence to their advice. 

## Table of Contents

1. [Manual Installation](#manual-installation)
    - [Packages](#packages)
    - [Android](#android)
2. [Code Structure](#code-structure)
    - ["assets" folder](#assetsfolder)
    - ["components" folder](#componentsfolder)
    - ["utilities" folder](#utilitiesfolder)
    - ["routes" folder](#routesfolder)
    - ["screen" folder](#screensfolder)
        - [AuthStack](#authstack)
        - [HomeStack](#homestack)
        - [CalendarStack](#calendarstack)
        - [MedicineStack](#medicinestack)
        - [DoctorStack](#doctorstack)
        - [MoreStack](#morestack)
3. [Authors](#authors)

## Manual Installation
#### Packages

In your `package.json`

```xml
    .....
    "dependencies": {
        "@react-native-community/checkbox": "^0.5.6",
        "@react-native-community/cli-platform-android": "^4.13.0",
        "@react-native-community/cli-platform-ios": "^4.13.0",
        "@react-native-community/datetimepicker": "^3.0.6",
        "@react-native-community/masked-view": "^0.1.10",
        "@react-native-firebase/app": "^10.1.0",
        "@react-native-firebase/auth": "^10.1.0",
        "@react-native-firebase/firestore": "^10.1.0",
        "@react-native-firebase/ml-vision": "^7.4.13",
        "@react-native-firebase/storage": "^10.1.0",
        "expo": "^39.0.5",
        "expo-constants": "^9.2.0",
        "expo-permissions": "^9.3.0",
        "moment": "^2.29.1",
        "react": "^17.0.1",
        "react-native": "^0.63.4",
        "react-native-alarm-notification": "^1.4.6",
        "react-native-camera": "^3.40.0",
        "react-native-chart-kit": "^6.7.0",
        "react-native-elements": "^3.0.0-alpha.1",
        "react-native-gesture-handler": "^1.9.0",
        "react-native-image-picker": "^2.3.4",
        "react-native-reanimated": "^1.13.2",
        "react-native-safe-area-context": "^3.1.9",
        "react-native-safe-area-view": "^1.1.1",
        "react-native-screens": "^2.15.0",
        "react-native-simple-dialogs": "^1.4.0",
        "react-native-simple-toast": "^1.1.3",
        "react-native-svg": "^12.1.0",
        "react-native-vector-icons": "^7.1.0",
        "react-native-view-more-text": "^2.1.0",
        "react-navigation": "^4.4.3",
        "react-navigation-drawer": "^2.6.0",
        "react-navigation-stack": "^2.10.2",
        "react-navigation-tabs": "^2.10.1"
    },
    "devDependencies": {
        "@babel/core": "^7.12.9",
        "@babel/runtime": "^7.12.5",
        "@react-native-community/cli": "^4.13.1",
        "@react-native-community/eslint-config": "^2.0.0",
        "babel-jest": "^26.6.3",
        "eslint": "^7.14.0",
        "jest": "^26.6.3",
        "metro-react-native-babel-preset": "^0.64.0",
        "patch-package": "^6.2.2",
        "react-test-renderer": "^17.0.1"
    },
    .....
```

#### Android

In your `android/app/src/main/AndroidManifest.xml`

```xml
    .....
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA"/>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />

    <application ....>
        <receiver
            android:name="com.emekalites.react.alarm.notification.AlarmReceiver"
            android:enabled="true"
            android:exported="true">
            <intent-filter>
                <action android:name="ACTION_DISMISS" />
                <action android:name="ACTION_SNOOZE" />
            </intent-filter>
        </receiver>

        <receiver
            android:name="com.emekalites.react.alarm.notification.AlarmDismissReceiver"
            android:enabled="true"
            android:exported="true" />

        <receiver
            android:name="com.emekalites.react.alarm.notification.AlarmBootReceiver"
            android:directBootAware="true"
            android:enabled="false"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.QUICKBOOT_POWERON" />
                <action android:name="com.htc.intent.action.QUICKBOOT_POWERON" />
                <action android:name="android.intent.action.LOCKED_BOOT_COMPLETED" />
            </intent-filter>
        </receiver>
     .....
```

In your `android/build.gradle`

```xml
    .....
    ext {
        buildToolsVersion = "28.0.3"
        minSdkVersion = 21
        compileSdkVersion = 28
        targetSdkVersion = 28
    }
    .....
    dependencies {
        .....
        classpath 'com.google.gms:google-services:4.2.0'
    }
     .....
```

In your `android/app/build.gradle`

```xml
    .....
    apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
    apply plugin: 'com.google.gms.google-services'
     .....
```

In your `android/app/src/main/java/com/reamotreactnative/MainActivity.java`
```xml
package com.reamotreactnative;

import android.content.Intent;
import android.os.Bundle;

import com.emekalites.react.alarm.notification.BundleJSONConverter;
import com.facebook.react.ReactActivity;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONObject;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "ReamotReactNative";
    }

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        try {
            Bundle bundle = intent.getExtras();
            if (bundle != null) {
                JSONObject data = BundleJSONConverter.convertToJSON(bundle);
                getReactInstanceManager().getCurrentReactContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("OnNotificationOpened", data.toString());
            }
        } catch (Exception e) {
            System.err.println("Exception when handling notification opened. " + e);
        }
    }
}
```

## Code Structure:
### "assets" folder
The folder includes images used locally within the application.

### "components" folder
The folder includes components that is used multiple times in the application.

### "utilities" folder
The folder includes helper functions that can be used within the application.

### "routes" folder
The folder includes 6 stacks:

- AuthStack.
- HomeStack.
- CalendarStack.
- MedicineStack
- DoctorStack.
- MoreStack.

Each stack is for an option in BottomTabNavigator except AuthStack. MoreStack is as a DrawerNavigator.

### "screens" folder
The folder includes screens of 6 above stacks.

#### AuthStack
The stack includes Register, SignIn, ForgotPassword, and TermsOfService Screens:
- Patients can register by providing their full name, email, password, phone number, and accepting Reamot Terms of Services. Then patients have to click on verification link in their email to verify their account before using the main part of the application.
- Patients can sign in using registered email and password.
- If a patient already signs in, they dont have to sign in again next time they open the application on the same mobile device (thanks to LoadingScreen.js)
- If a patient forgets his/her password, he/she can enters email address in the input section, and a link will be sent to that email to reset his/her password.

#### HomeStack
The stack includes the Home Screen and Medication Information Screen. 

Home Screen includes 3 sections:
- A "Medication Taking History For The Day" List including taken, missed reminder for the day
- An "Upcoming Reminders" List including upcoming reminders for the day.
- An image of a "growing" flower, that its growing status will be changed based on the value of: `(Taken Medicine * 100) / (Missed Medicine + Taken Medicine + Upcoming Reminders)`

When clicking on a medicine in one of the 2 lists in Home Screen, the Medication Information Screen pops up, showing the information of the medicine clicked on including medicine name, image, and information.

#### CalendarStack
The stack shows patient's medication taking history for each day. It will show the medication details, the taking status, and the time for each time a medicine is taken or missed. A Progress Chart is showed at the bottom of the screen to show the patient's taking medicine progress of that day.

#### MedicineStack
The stack shows:
- Patient's Medicine Information according to their prescription
- Medicine Remaining Pills, which will be decreased based on the information in prescription, to remind patient when medicine runs out
- Their Reminder including the name of the medicine and the time of the reminder
- When the time of the reminder is reached, an alarm is sound and the patient has to:
- scan the barcode of the medicine to stop the alarm with status as "taken", or
- click "Miss Medicine" to stop the alarm with status as "missed"

#### DoctorStack
The stack shows:
- Accessed and Non-Accessed Doctor and Pharmacist list
- Detail information for each doctor and pharmacist
- Choices to give or revoke doctor/pharmacist access to patient's information to monitor their medication adherence, and/or to schedule appointments with doctor.

#### MoreStack
This is a DrawerNavigator with multiple options to:
- edit their account,
- change password,
- view their upcomming and past appointments with the doctors,
- view FAQ,
- view Terms Of Services, and
- to log out of the application

## Authors

* **Phuoc Hoang Minh Nguyen** - *Lead Developer* - [PhuocHoangMinhNguyen](https://github.com/PhuocHoangMinhNguyen)
* **Quang Duy Nguyen** - *HomeStack, EditProfileScreen Developer and Automated Tester* - [Duy1999](https://github.com/Duy1999)

See also the list of [contributors](https://github.com/PhuocHoangMinhNguyen/ReamotReactNative/graphs/contributors) who participated in this project.
