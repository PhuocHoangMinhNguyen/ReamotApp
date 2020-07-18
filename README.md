# Reamot

Reamot is a system, which will be developed with the aim to allow both doctors and pharmacists to monitor the medication adherence of their patients. 
In order for the system to work, it will be compromised of a mobile app (compatible with both iOS and Android) for patients to not only be reminded to take their medication but to also log in when they take it, as well as a webpage for doctors and pharmacists to gain access to their patient's habits and adherence to their advice. 

## Android manual Installation

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

## Code Structure:
The program including 6 stacks.
- AuthStack
- HomeStack
- CalendarStack
- MedicineStack
- DoctorStack
- ProfileStack
Each stack is for an option in TabBarNavigation except AuthStack.

### Break down into end to end tests

Explain what these tests test and why

```
Give an example
```

### And coding style tests

Explain what these tests test and why

```
Give an example
```

## Deployment

Add additional notes about how to deploy this on a live system

## Built With

* [Dropwizard](http://www.dropwizard.io/1.0.2/docs/) - The web framework used
* [Maven](https://maven.apache.org/) - Dependency Management
* [ROME](https://rometools.github.io/rome/) - Used to generate RSS Feeds

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Billie Thompson** - *Initial work* - [PurpleBooth](https://github.com/PurpleBooth)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Hat tip to anyone whose code was used
* Inspiration
* etc
