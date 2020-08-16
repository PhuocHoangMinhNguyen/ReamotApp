# Reamot

Reamot is a system, which will be developed with the aim to allow both doctors and pharmacists to monitor the medication adherence of their patients. 

Reamot is compromised of a mobile app (compatible with both iOS and Android) for patients to not only be reminded to take their medication but to also log in when they take it, as well as a webpage for doctors and pharmacists to gain access to their patient's habits and adherence to their advice. 

## Table of Contents

1. [Manual Installation](#manual-installation)
    - [Android](#android)
2. [Code Structure](#code-structure)
    - [AuthStack](#authstack)
    - [HomeStack](#homestack)
    - [CalendarStack](#calendarstack)
    - [MedicineStack](#medicinestack)
    - [DoctorStack](#doctorstack)
    - [ProfileStack](#profilestack)
3. [Authors](#authors)

## Manual Installation
#### Android & iOS

In your `package.json`


```xml
    .....
    "dependencies": {
        "@react-native-community/checkbox": "^0.4.2",
        "@react-native-community/cli-platform-android": "^4.11.0",
        "@react-native-community/cli-platform-ios": "^4.11.0",
        "@react-native-community/datetimepicker": "^3.0.0",
        "@react-native-community/masked-view": "^0.1.10",
        "@react-native-firebase/app": "^8.3.1",
        "@react-native-firebase/auth": "^8.3.3",
        "@react-native-firebase/firestore": "^7.5.3",
        "@react-native-firebase/ml-vision": "^7.3.2",
        "@react-native-firebase/storage": "^7.3.3",
        "expo": "^38.0.9",
        "expo-constants": "^9.1.1",
        "expo-permissions": "^9.1.0",
        "moment": "^2.26.0",
        "moment-range": "^4.0.2",
        "react": "^16.13.1",
        "react-native": "^0.63.2",
        "react-native-alarm-notification": "^1.4.6",
        "react-native-barcode-mask": "^1.2.4",
        "react-native-calendars": "^1.313.0",
        "react-native-camera": "^3.36.0",
        "react-native-elements": "^2.2.1",
        "react-native-gesture-handler": "^1.7.0",
        "react-native-image-picker": "^2.3.3",
        "react-native-keyboard-aware-scroll-view": "^0.9.2",
        "react-native-push-notification": "^5.0.1",
        "react-native-reanimated": "^1.13.0",
        "react-native-safe-area-context": "^3.1.4",
        "react-native-safe-area-view": "^1.1.1",
        "react-native-screens": "^2.10.1",
        "react-native-searchable-dropdown": "^1.1.1",
        "react-native-simple-dialogs": "^1.2.1",
        "react-native-simple-toast": "^1.1.2",
        "react-native-vector-icons": "^7.0.0",
        "react-native-view-more-text": "^2.1.0",
        "react-navigation": "^4.3.9",
        "react-navigation-drawer": "^2.5.0",
        "react-navigation-stack": "^2.5.1",
        "react-navigation-tabs": "^2.8.13"
    },
    "devDependencies": {
        "@babel/core": "^7.11.1",
        "@babel/runtime": "^7.11.2",
        "@react-native-community/cli": "^4.12.0",
        "@react-native-community/eslint-config": "^2.0.0",
        "babel-jest": "^26.3.0",
        "eslint": "^7.7.0",
        "jest": "^26.4.0",
        "metro-react-native-babel-preset": "^0.62.0",
        "patch-package": "^6.2.2",
        "react-test-renderer": "^16.13.1"
    },
    .....
```

#### Android

In your `AndroidManifest.xml`

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

## Code Structure:
### "routes" folder
### "screens" folder
The program including 6 stacks.

- AuthStack.
- HomeStack.
- CalendarStack.
- MedicineStack
- DoctorStack.
- MoreStack.

Each stack is for an option in BottomTabNavigator except AuthStack. MoreStack is as a DrawerNavigator.

#### AuthStack
The stack includes Register, SignIn, ForgotPassword, and TermsOfService Screens:
- Patients can register by providing their full name, email, password, phone number, and accepting Reamot Terms of Services. Then patients have to click on verification link in their email to verify their account before using the main part of the application.
- Patients can sign in using registered email and password.
- If a patient already signs in, they dont have to sign in again next time they open the application on the same mobile device (thanks to LoadingScreen.js)
- If a patient forgets his/her password, he/she can enters email address in the input section, and a link will be sent to that email to reset his/her password.

#### HomeStack
The stack includes the Home Screen and Medication Information Screen. Home Screen includes 3 sections:
- A "Medication Taking History For The Day" List including taken, missed reminder for the day
- An "Upcoming Reminders" List including upcoming reminders for the day.
- An image of a "growing" flower, that its growing status will be changed based on the value of: `(Taken Medicine * 100) / (Missed Medicine + Taken Medicine + Upcoming Reminders)`

#### CalendarStack
The stack shows patient's medication taking history for each day. It will show the medication details, the taking status, and the time for each time a medicine is taken or missed.

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
- view their appointments with the doctors,
- view FAQ,
- view Terms Of Services, and
- to log out of the application

## Authors

* **Phuoc Hoang Minh Nguyen** - *Lead Developer* - [PhuocHoangMinhNguyen](https://github.com/PhuocHoangMinhNguyen)
* **Quang Duy Nguyen** - *HomeStack and EditProfileScreen Developer* - [Duy1999](https://github.com/Duy1999)

See also the list of [contributors](https://github.com/PhuocHoangMinhNguyen/ReamotReactNative/graphs/contributors) who participated in this project.
