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
The program including 6 stacks.

- AuthStack.
- HomeStack.
- CalendarStack.
- MedicineStack
- DoctorStack.
- ProfileStack.

Each stack is for an option in TabBarNavigation except AuthStack.

#### AuthStack
The stack includes Register and SignIn Screens.
- Patient can register by providing their full name, email, password, and phone number
- Patient can sign in using registered email and password.
- If the patient already signs in, they dont have to sign in again next time they open the application on the same mobile device (thanks to LoadingScreen.js)

#### HomeStack
The stack includes the Home Screen of the application.

#### CalendarStack
The stack shows patient's medication taking history for each day.

#### MedicineStack
The stack shows:
- Patient's Medicine Information according to their prescription
- Their Reminder including the name of the medicine and the time of the reminder
- When the time of the reminder is reached, an alarm is sound and the patient has to scan the barcode of the medicine to stop the alarm.

#### DoctorStack
The stack shows:
- Doctor and Pharmacist list
- Detail information for each doctor and pharmacist
- Choices to give doctor/pharmacist their access to monitor their information, and/or to schedule appointments with doctor.

#### ProfileStack
The stack allows users: 
- to manage and edit their account
- to manage their appointments with the doctors.
- to log out of the application

## Authors

* **Phuoc Hoang Minh Nguyen** - *Lead Developer* - [PhuocHoangMinhNguyen](https://github.com/PhuocHoangMinhNguyen)
* **Quang Duy Nguyen** - *HomeStack and ProfileStack Developer* - [Duy1999](https://github.com/Duy1999)

See also the list of [contributors](https://github.com/PhuocHoangMinhNguyen/ReamotReactNative/graphs/contributors) who participated in this project.
