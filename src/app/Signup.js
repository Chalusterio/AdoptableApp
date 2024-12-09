import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  ActivityIndicator,
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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isOrganization, setIsOrganization] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false); // Loading state

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    organizationName: "",
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
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
    const newErrors = {
      firstName: "",
      lastName: "",
      organizationName: "",
      email: "",
      contactNumber: "",
      password: "",
      confirmPassword: "",
    };

    if (isOrganization) {
      if (!organizationName.trim()) {
        newErrors.organizationName = "Organization name is required";
        valid = false;
      }
    } else {
      if (!firstName.trim()) {
        newErrors.firstName = "First name is required";
        valid = false;
      }
      if (!lastName.trim()) {
        newErrors.lastName = "Last name is required";
        valid = false;
      }
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
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

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSignup = async () => {
    if (!validateInputs()) return;

    setIsSigningUp(true); // Set loading state to true

    const name = isOrganization ? organizationName : `${firstName} ${lastName}`;

    try {
      await registerUser(email, password, name, contactNumber);
      router.push({
        pathname: "Options",
        params: {
          userName: name,
          userEmail: email,
          userContactNumber: contactNumber,
        },
      });

      setDialogVisible(true); // Show success dialog
      setFirstName("");
      setLastName("");
      setOrganizationName("");
      setEmail("");
      setContactNumber("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.log("Registration error:", error.message);
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: error.message,
      }));
    } finally {
      setIsSigningUp(false); // Reset loading state after process
    }
  };

  const handleToggleSignupMode = () => {
    setIsOrganization((prev) => !prev);
    setFirstName("");
    setLastName("");
    setOrganizationName("");
  };

  const hideDialog = () => setDialogVisible(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
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

            {isOrganization ? (
              <TextInput
                label="Organization Name"
                value={organizationName}
                onChangeText={setOrganizationName}
                style={[
                  styles.input,
                  errors.organizationName && styles.errorInput,
                ]}
                left={<TextInput.Icon icon="account" />}
                mode="flat"
                activeUnderlineColor="gray"
              />
            ) : (
              <>
                <View style={styles.nameContainer}>
                  <TextInput
                    label="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                    style={[
                      styles.nameInput,
                      errors.firstName && styles.errorInput,
                    ]}
                    left={<TextInput.Icon icon="account" />}
                    mode="flat"
                    activeUnderlineColor="gray"
                    autoCapitalize="words"
                  />
                  <TextInput
                    label="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                    style={[
                      styles.nameInput,
                      errors.lastName && styles.errorInput,
                    ]}
                    left={<TextInput.Icon icon="account" />}
                    mode="flat"
                    activeUnderlineColor="gray"
                    autoCapitalize="words"
                  />
                </View>
                {errors.firstName && (
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                )}
                {errors.lastName && (
                  <Text style={styles.errorText}>{errors.lastName}</Text>
                )}
              </>
            )}

            {errors.organizationName && (
              <Text style={styles.errorText}>{errors.organizationName}</Text>
            )}

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              left={<TextInput.Icon icon="email" />}
              mode="flat"
              autoCapitalize="none"
              activeUnderlineColor="gray"
              keyboardType="email-address"
              style={[styles.input, errors.email && styles.errorInput]}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

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
              autoCapitalize="none"
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

            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={[
                styles.input,
                errors.confirmPassword && styles.errorInput,
              ]}
              left={<TextInput.Icon icon="lock-check" />}
              mode="flat"
              autoCapitalize="none"
              activeUnderlineColor="gray"
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? "eye" : "eye-off"}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
              secureTextEntry={!showConfirmPassword}
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}

            <TouchableOpacity
              style={[styles.signupButton, isSigningUp && { opacity: 0.5 }]}
              onPress={handleSignup}
              disabled={isSigningUp} // Disable button during loading
            >
              {isSigningUp ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.signupButtonText}>Sign Up</Text>
              )}
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

            {/* Dialog */}
            <Portal>
              <Dialog visible={dialogVisible} onDismiss={hideDialog}>
                <Dialog.Icon icon="check-circle" color="#68C2FF" />
                <Dialog.Title style={styles.dialogTitle}>Success</Dialog.Title>
                <Dialog.Content style={styles.dialogContent}>
                  <Text style={styles.dialogText}>
                    Account created successfully!
                  </Text>
                </Dialog.Content>
                <Dialog.Actions style={styles.dialogActions}>
                  <TouchableOpacity
                    onPress={hideDialog}
                    style={styles.dialogButton}
                  >
                    <Text style={styles.dialogButtonText}>Done</Text>
                  </TouchableOpacity>
                </Dialog.Actions>
              </Dialog>
            </Portal>
          </View>
        </ImageBackground>
      </ScrollView>
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
  nameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nameInput: {
    flex: 1,
    marginHorizontal: 5, // Space between inputs
    marginBottom: 20,
    backgroundColor: "#F5F5F5",
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
