import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from "react-native";
import { TextInput, useTheme, Dialog, Portal } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Font from "expo-font";
import { useRouter } from 'expo-router';
import { registerUser } from '../../firebase'; // Use the registerUser function

export default function Signup() {
  const theme = useTheme();
  const router = useRouter();

  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    contactNumber: "",
    password: "",
  });

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        Lilita: require("../assets/fonts/LilitaOne-Regular.ttf"),
      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const validateInputs = () => {
    let valid = true;
    const newErrors = { name: "", email: "", contactNumber: "", password: "" };

    if (!name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zAZ]{2,}$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address";
        valid = false;
      }
    }
    if (!contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
      valid = false;
    } else if (!/^\d+$/.test(contactNumber)) {
      newErrors.contactNumber = "Contact number must contain only numbers";
      valid = false;
    }
    if (!password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSignup = async () => {
    if (!validateInputs()) return;

    try {
      await registerUser(email, password, name, contactNumber); // Call registerUser
      router.push({
        pathname: "Options",
        params: { userName: name, userEmail: email, userContactNumber: contactNumber },
      });

      setDialogVisible(true); // Show success dialog
      setName(""); // Reset form
      setEmail("");
      setContactNumber("");
      setPassword("");
    } catch (error) {
      console.log("Registration error:", error.message);
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: error.message,
      }));
    }
  };

  const hideDialog = () => setDialogVisible(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../assets/Signup/ppaw.png")}
        style={styles.background}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Sign up to adopt!</Text>
          <MaterialCommunityIcons
            name="paw"
            size={24}
            color={theme.colors.primary}
            style={styles.icon}
          />
          <Text style={styles.subtitle}>Create your account</Text>

          <TextInput
            label="Name"
            value={name}
            onChangeText={setName}
            style={[styles.input, errors.name && styles.errorInput]}
            left={<TextInput.Icon icon="account" />}
            mode="flat"
            activeUnderlineColor="gray"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            left={<TextInput.Icon icon="email" />}
            mode="flat"
            activeUnderlineColor="gray"
            keyboardType="email-address"
            style={[styles.input, errors.email && styles.errorInput]}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <TextInput
            label="Contact Number"
            value={contactNumber}
            onChangeText={setContactNumber}
            style={[styles.input, errors.contactNumber && styles.errorInput]}
            left={<TextInput.Icon icon="phone" />}
            keyboardType="phone-pad"
            mode="flat"
            activeUnderlineColor="gray"
          />
          {errors.contactNumber && (
            <Text style={styles.errorText}>{errors.contactNumber}</Text>
          )}

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            style={[styles.input, errors.password && styles.errorInput]}
            left={<TextInput.Icon icon="lock" />}
            mode="flat"
            activeUnderlineColor="gray"
            right={
              <TextInput.Icon
                icon={showPassword ? "eye" : "eye-off"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            secureTextEntry={!showPassword}
          />
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </TouchableOpacity>

          <Portal>
            <Dialog visible={dialogVisible} onDismiss={hideDialog}>
              <Dialog.Icon icon="check-circle" color="#68C2FF" />
              <Dialog.Title style={styles.dialogTitle}>Success</Dialog.Title>
              <Dialog.Content>
                <Text style={styles.dialogText}>Account created successfully!</Text>
              </Dialog.Content>
              <Dialog.Actions>
                <TouchableOpacity onPress={hideDialog}>
                  <Text style={styles.dialogButton}>Ok</Text>
                </TouchableOpacity>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50, // Add paddingTop to avoid status bar overlap
  },
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Semi-transparent background to make text readable
    borderRadius: 10,
  },
  title: {
    fontSize: 50,
    fontFamily: "Lilita",
    textAlign: "center",
    color: "#68C2FF",
    marginTop: 50,
  },
  icon: {
    alignSelf: "center",
    marginVertical: 10,
  },
  subtitle: {
    textAlign: "center",
    fontFamily: "Lato",
    fontSize: 18,
    marginTop: -30,
    marginBottom: 40,
  },
  input: {
    marginBottom: 20,
    backgroundColor: "#F5F5F5",
  },
  signupButton: {
    backgroundColor: "#EF5B5B",
    marginTop: 30,
    paddingVertical: 15,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  signupButtonText: {
    color: "white",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: "#3B3B3B",
  },
  loginText: {
    color: "#68C2FF",
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    height: 1,
    flex: 1,
    backgroundColor: "#3B3B3B",
  },
  orText: {
    marginHorizontal: 10,
    color: "#3B3B3B",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  iconButton: {
    marginHorizontal: 15,
  },
  errorInput: {
    borderColor: "red",
    borderWidth: 1,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
  },
  dialogTitle: {
    color: "#68C2FF",
    fontSize: 20,
  },
  dialogContent: {
    marginBottom: 10,
  },
  dialogText: {
    fontSize: 16,
    color: "#3B3B3B",
  },
  dialogActions: {
    justifyContent: "center",
  },
  dialogButton: {
    paddingVertical: 10,
  },
  dialogButtonText: {
    fontSize: 16,
    color: "#68C2FF",
  },
});
