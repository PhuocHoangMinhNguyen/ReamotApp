// Author: Phuoc Hoang Minh Nguyen
// Description: Used to allow patients to add their own medicine
// Status: Optimized

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Text,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import UploadImage from '../../utilities/UploadImage';
import Background from '../../components/Background';
import Ionicons from '@react-native-vector-icons/ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import CheckBox from '@react-native-community/checkbox';
import Toast from 'react-native-simple-toast';

class AddMedicine extends React.Component {
  state = {
    medicine: {
      name: '',
      image: null,
      number: '',
      times: '',
      note: null,
    },
    reminder: {
      dailyType: false,
      weeklyType: false,
    },
  };

  // To pick image from library or take a photo for medicine image (optional)
  handlePickImage = async () => {
    const response = await launchImageLibrary({ mediaType: 'photo' });
    if (response.didCancel || response.errorCode) {
      return;
    }
    if (response.assets && response.assets[0]) {
      this.setState({
        medicine: { ...this.state.medicine, image: response.assets[0].uri },
      });
    }
  };

  // Make sure all the information is enter successfully before adding the medicine into Firebase
  handleAdd = () => {
    const { name, number, times } = this.state.medicine;
    const { dailyType, weeklyType } = this.state.reminder;
    if (name.trim() === '') {
      Toast.show('Please Enter Medicine Name', Toast.LONG);
    } else if (number === '' || !(parseInt(number, 10) > 0)) {
      Toast.show(
        'Please enter number of capsules for each time you take medicine',
        Toast.LONG,
      );
    } else if (times === '' || !(parseInt(times, 10) > 0)) {
      Toast.show(
        'Please enter number of times you have to take medicine per day/week',
        Toast.LONG,
      );
    } else if (dailyType === false && weeklyType === false) {
      Toast.show('Please Choose a Reminder Type', Toast.LONG);
    } else {
      this.addMedicine();
    }
  };

  // Add the medicine into Firebase
  addMedicine = async () => {
    const { name, image, note, number, times, barcode } = this.state.medicine;
    const { dailyType } = this.state.reminder;
    let remoteUri = null;
    let medicineImage = null;
    if (image) {
      // Store the avatar in Firebase Storage
      remoteUri = await UploadImage.uploadPhotoAsync(
        image,
        `medicines/${(auth().currentUser || {}).uid}`,
      );
      // Then Store the avatar in Cloud Firestore
      medicineImage = remoteUri;
    }

    const prescriptionData = {
      name: name,
      patientEmail: auth().currentUser.email,
      authorEmail: auth().currentUser.email,
      note: note,
      number: parseInt(number, 10),
      times: parseInt(times, 10),
      type: dailyType === true ? 'Daily' : 'Weekly',
    };

    const addPrescription = () => {
      firestore()
        .collection('prescription')
        .add(prescriptionData)
        .then(() => {
          this.props.navigation.goBack();
          Toast.show('A new medicine is added !');
        })
        .catch(error => Toast.show(error.message));
    };

    // Check for an existing medicine entry with the same name to avoid duplicates.
    let existingMeds;
    try {
      existingMeds = await firestore()
        .collection('medicine')
        .where('name', '==', name)
        .get();
    } catch (error) {
      Toast.show(error.message);
      return;
    }

    if (!existingMeds.empty) {
      // Reuse existing medicine document — only add the prescription.
      addPrescription();
    } else {
      firestore()
        .collection('medicine')
        .add({
          name: name,
          barcode: barcode,
          description: null,
          image: medicineImage,
          adder: 'patient',
        })
        .then(() => addPrescription())
        .catch(error => Toast.show(error.message));
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <Background />
        <TouchableOpacity
          style={styles.back}
          onPress={() => this.props.navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={30} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Medication</Text>
        <View style={styles.cover}>
          <TouchableOpacity
            style={styles.imagePlaceholder}
            onPress={this.handlePickImage}
          >
            <Image
              style={styles.image}
              source={{ uri: this.state.medicine.image }}
            />
            <Ionicons
              name="ios-add"
              size={40}
              color="#FFF"
              style={styles.addIcon}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.cover2}>
          <View style={styles.textInputContainer1}>
            <TextInput
              placeholder="Medicine Name"
              onChangeText={name =>
                this.setState({
                  medicine: { ...this.state.medicine, name: name },
                })
              }
              value={this.state.medicine.name}
            />
          </View>
          <View style={styles.textInputContainer2}>
            <TextInput
              placeholder="Medicine Barcode"
              keyboardType="numeric"
              onChangeText={barcode =>
                this.setState({
                  medicine: { ...this.state.medicine, barcode: barcode },
                })
              }
              value={this.state.medicine.barcode}
            />
          </View>
        </View>
        <View style={styles.reminderType}>
          <CheckBox
            value={this.state.reminder.dailyType}
            onValueChange={newValue => {
              if (
                this.state.reminder.weeklyType !==
                  this.state.reminder.dailyType &&
                newValue === true
              ) {
                this.setState({
                  reminder: {
                    ...this.state.reminder,
                    dailyType: newValue,
                    weeklyType: !this.state.reminder.weeklyType,
                  },
                });
              } else {
                this.setState({
                  reminder: {
                    ...this.state.reminder,
                    dailyType: newValue,
                  },
                });
              }
            }}
          />
          <Text>Taken Daily</Text>
          <CheckBox
            value={this.state.reminder.weeklyType}
            onValueChange={newValue => {
              if (
                this.state.reminder.weeklyType !==
                  this.state.reminder.dailyType &&
                newValue === true
              ) {
                this.setState({
                  reminder: {
                    ...this.state.reminder,
                    dailyType: !this.state.reminder.dailyType,
                    weeklyType: newValue,
                  },
                });
              } else {
                this.setState({
                  reminder: {
                    ...this.state.reminder,
                    weeklyType: newValue,
                  },
                });
              }
            }}
          />
          <Text>Taken Weekly</Text>
        </View>
        <View style={styles.numberTimes}>
          <View style={styles.number}>
            <TextInput
              placeholder="Number"
              keyboardType="numeric"
              onChangeText={number =>
                this.setState({
                  medicine: { ...this.state.medicine, number: number },
                })
              }
              value={this.state.medicine.number}
            />
          </View>
          <View style={styles.times}>
            <TextInput
              placeholder="Times"
              keyboardType="numeric"
              onChangeText={times =>
                this.setState({
                  medicine: { ...this.state.medicine, times: times },
                })
              }
              value={this.state.medicine.times}
            />
          </View>
        </View>
        <View style={styles.note}>
          <TextInput
            placeholder="Note"
            autoCapitalize="none"
            onChangeText={note =>
              this.setState({
                medicine: { ...this.state.medicine, note: note },
              })
            }
            value={this.state.medicine.note}
          />
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => this.handleAdd()}
        >
          <Text style={styles.buttonText}>Add Medicine</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  back: {
    position: 'absolute',
    top: 24,
    left: 24,
    width: 30,
    height: 30,
    borderRadius: 16,
    backgroundColor: 'rgba(21, 22, 48, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginTop: -140,
    textAlign: 'center',
    color: '#FFF',
  },
  cover: {
    marginHorizontal: 30,
    marginTop: 20,
    alignItems: 'center',
  },
  cover2: {
    flexDirection: 'row',
    marginHorizontal: 30,
    marginVertical: 12,
  },
  imagePlaceholder: {
    width: 110,
    height: 110,
    backgroundColor: '#A9A9A9',
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  textInputContainer1: {
    backgroundColor: '#DDD',
    borderRadius: 4,
    flex: 1,
    marginRight: 8,
  },
  textInputContainer2: {
    backgroundColor: '#DDD',
    borderRadius: 4,
    flex: 1,
    marginLeft: 8,
  },
  reminderType: {
    marginHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  button: {
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
    width: 110,
    height: 40,
    backgroundColor: '#1565C0',
    borderRadius: 4,
    marginVertical: 12,
    marginEnd: 30,
  },
  buttonText: {
    color: '#FFF',
  },
  number: {
    backgroundColor: '#DDD',
    borderRadius: 4,
    flex: 1,
    marginRight: 8,
  },
  times: {
    backgroundColor: '#DDD',
    borderRadius: 4,
    flex: 1,
    marginLeft: 8,
  },
  numberTimes: {
    flexDirection: 'row',
    marginHorizontal: 30,
    marginVertical: 12,
  },
  note: {
    backgroundColor: '#DDD',
    borderRadius: 4,
    marginHorizontal: 30,
  },
  addIcon: {
    marginTop: 6,
    marginLeft: 2,
  },
});

export default AddMedicine;
