import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { TextInput, useTheme, Dialog, Portal } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Font from "expo-font";
import { useRouter } from "expo-router";
import { registerUser } from "../../firebase"; // Use the registerUser function

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
  const [isOrganization, setIsOrganization] = useState(false);

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
      newErrors.name = isOrganization
        ? "Organization name is required"
        : "Name is required";
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
        params: {
          userName: name,
          userEmail: email,
          userContactNumber: contactNumber,
        },
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

  const handleToggleSignupMode = () => {
    setIsOrganization((prev) => !prev); // Toggle between modes
    setName(""); // Reset the name field
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
            label={isOrganization ? "Organization Name" : "Name"}
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

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push("Login")}>
              <Text style={styles.loginText}> Login</Text>
            </TouchableOpacity>
          </View>

          {/* Divider with "or" */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider}></View>
            <Text style={styles.orText}>OR</Text>
            <View style={styles.divider}></View>
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity onPress={handleToggleSignupMode}>
              <Text style={styles.signupOrganizationText}>
                {isOrganization
                  ? "Sign up as an individual"
                  : "Sign up as an organization"}
              </Text>
            </TouchableOpacity>
          </View>

          <Portal>
            <Dialog visible={dialogVisible} onDismiss={hideDialog}>
              <Dialog.Icon icon="check-circle" color="#68C2FF" />
              <Dialog.Title style={styles.dialogTitle}>Success</Dialog.Title>
              <Dialog.Content>
                <Text style={styles.dialogText}>
                  Account created successfully!
                </Text>
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
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
  },
  signupButtonText: {
    fontFamily: "Lato",
    fontSize: 16,
    color: "white",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    fontFamily: "Lato",
  },
  loginText: {
    fontFamily: "Lato",
    color: "gray",
    marginLeft: 10,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  iconButton: {
    marginHorizontal: 10,
    marginBottom: 15,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
  },
  // Divider styles
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    flex: 1,
  },
  orText: {
    marginHorizontal: 10,
    color: "#888",
    fontSize: 14,
  },
  signupOrganizationText: {
    fontFamily: "Lato",
    color: "gray",
    marginLeft: 10,
  },
  //dialog
  dialogTitle: {
    textAlign: "center", // Center align the title
    fontFamily: "Lato",
    fontSize: 30,
  },
  dialogContent: {
    alignItems: "center", // Center align the content
    justifyContent: "center", // Center vertically
  },
  dialogText: {
    textAlign: "center",
    fontSize: 15,
  },
  dialogActions: {
    justifyContent: "center", // Center align the actions (button)
    alignItems: "center", // Center horizontally
  },
  dialogButton: {
    backgroundColor: "#68C2FF", // Set the background color
    width: 150, // Set the width of the button
    height: 50, // Set the height of the button
    borderRadius: 25, // Set the border radius for rounded corners
    justifyContent: "center", // Center align text inside button
    alignItems: "center", // Center align text inside button
  },
  dialogButtonText: {
    textAlign: "center",
    fontSize: 15,
    color: "white",
    fontFamily: "Lato",
  },
});

