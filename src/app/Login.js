import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import {
  useTheme,
  TextInput,
  Checkbox,
  Dialog,
  Portal,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Font from "expo-font";
import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect
import { useRouter } from 'expo-router';

export default function Login({ }) {
  const theme = useTheme();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
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

  useFocusEffect(
    React.useCallback(() => {
      // Reset errors when the screen is focused
      setErrors({ email: "", password: "" });
    }, [])
  );

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const validateInputs = () => {
    let valid = true;
    const newErrors = { email: "", password: "" };

    if (!email) {
      newErrors.email = "Email is required";
      valid = false;
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address";
        valid = false;
      }
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

  const handleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  const handleLogin = () => {
    if (!validateInputs()) return;

    const userData = { email, password };
    console.log("User data:", userData);

    setDialogVisible(true);
    setEmail("");
    setPassword("");
    router.push("Main");
  };

  const hideDialog = () => setDialogVisible(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.backgroundContainer}>
          <ImageBackground
            source={require("../assets/Login/loginPawImage.png")}
            style={styles.loginPawImage}
            resizeMode="cover"
          >
            <View style={styles.textOverlayContainer}>
              <Text style={styles.welcomeBackText}>Welcome Back!</Text>
              <Text style={styles.loginText}>Login to your account</Text>
            </View>
          </ImageBackground>
        </View>

        <View
          style={[
            styles.formContainer,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: theme.colors.primary },
            ]}
          >
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
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!passwordVisible}
              right={
                <TextInput.Icon
                  icon={passwordVisible ? "eye" : "eye-off"}
                  color="black"
                  onPress={() => setPasswordVisible(!passwordVisible)}
                />
              }
              left={<TextInput.Icon icon="lock" />}
              mode="flat"
              activeUnderlineColor="gray"
              style={[styles.input, errors.password && styles.errorInput]}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          <View style={styles.rememberForgotContainer}>
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.rememberCheck}
                onPress={handleRememberMe}
              >
                <Checkbox
                  status={rememberMe ? "checked" : "unchecked"}
                  onPress={handleRememberMe}
                  color="gray"
                  uncheckedColor="gray"
                />
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity>
              <Text style={styles.forgotText}>Forgot Password</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={(handleLogin)}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <View style={styles.noAccountContainer}>
            <Text style={styles.noAccountText}>Don't have an account?</Text>
            <TouchableOpacity>
              <Text
                style={styles.signupButtonText}
                onPress={() => router.push("Signup")}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dialog */}
        <Portal>
          <Dialog visible={dialogVisible} onDismiss={hideDialog}>
            <Dialog.Icon icon="check-circle" color="#68C2FF" />
            <Dialog.Title style={styles.dialogTitle}>Success</Dialog.Title>
            <Dialog.Content style={styles.dialogContent}>
              <Text style={styles.dialogText}>Logged in successfully!</Text>
            </Dialog.Content>
            <Dialog.Actions style={styles.dialogActions}>
              <TouchableOpacity onPress={hideDialog} style={styles.dialogButton}>
                <Text style={styles.dialogButtonText}>Done</Text>
              </TouchableOpacity>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    flexDirection: "column",
  },
  backgroundContainer: {
    height: "30%", // Set fixed height for the background image
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  loginPawImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    width: "130%",
  },
  textOverlayContainer: {
    position: "absolute",
    top: "40%", // Adjust this to control vertical alignment
    width: "100%",
    justifyContent: "center",
  },
  welcomeBackText: {
    fontSize: 50,
    fontFamily: "Lilita",
    color: "#68C2FF",
    textAlign: "center",
    marginTop: 100,
  },
  loginText: {
    fontFamily: "Lato",
    fontSize: 18,
    marginTop: 10,
    textAlign: "center",
  },
  formContainer: {
    flex: 1, // Take the remaining space after the background container
    width: "100%",
    alignItems: "center",
    marginTop: 80,
  },
  inputContainer: {
    width: "90%",
  },
  input: {
    backgroundColor: "#F3F3F3",
    marginBottom: 20,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
  },
  rememberForgotContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%",
    marginTop: -10,
  },
  rememberCheck: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxContainer: {
    marginLeft: -8,
  },
  rememberText: {
    fontFamily: "Lato",
    color: "gray",
  },
  forgotText: {
    fontFamily: "Lato",
    color: "gray",
  },
  loginButton: {
    width: "90%",
    backgroundColor: "#EF5B5B",
    marginTop: 40,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
  },
  loginButtonText: {
    fontFamily: "Lato",
    fontSize: 16,
    color: "white",
  },
  noAccountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 100,
  },
  noAccountText: {
    fontFamily: "Lato",
  },
  signupButtonText: {
    fontFamily: "Lato",
    color: "gray",
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 20,
    fontFamily: "Lato",
  },
  //dialog
  dialogTitle: {
    textAlign: "center",  // Center align the title
    fontFamily: 'Lato',
    fontSize: 30,
  },
  dialogContent: {
    alignItems: "center",  // Center align the content
    justifyContent: "center",  // Center vertically
  },
  dialogText: {
    textAlign: "center",  
    fontSize: 15,
  },
  dialogActions: {
    justifyContent: "center",  // Center align the actions (button)
    alignItems: "center",  // Center horizontally
  },
  dialogButton: {
    backgroundColor: '#68C2FF',  // Set the background color
    width: 150,  // Set the width of the button
    height: 50,  // Set the height of the button
    borderRadius: 25,  // Set the border radius for rounded corners
    justifyContent: 'center',  // Center align text inside button
    alignItems: 'center',  // Center align text inside button
  },
  dialogButtonText: {
    textAlign: "center",  
    fontSize: 15,
    color: 'white',
    fontFamily: 'Lato',
  },
});
