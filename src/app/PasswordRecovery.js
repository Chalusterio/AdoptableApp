import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, ImageBackground } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { getAuth, sendPasswordResetEmail } from "../../firebase";  //not kuan pa

export default function PasswordRecovery() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
  
    const handleRecovery = async () => {
      if (email.trim()) {
        try {
          // Use Firebase's sendPasswordResetEmail method
          await sendPasswordResetEmail(getAuth, email);
          setMessage("A verification code has been sent to your email.");
          // Redirect user to the verification screen
          router.push(""); //another screen for vericode?
        } catch (error) {
          setMessage("Error: " + error.message);
        }
      } else {
        setMessage("Please enter a valid email address.");
      }
    };
  

  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.backgroundContainer}>
        <ImageBackground
        source={require("../assets/Login/loginPawImage.png")}
        style={styles.loginPawImage}
        resizeMode="cover"
    ></ImageBackground>
    </View>
    <View style={styles.textOverlayContainer}>
        <Text style={styles.heading}>Password Recovery</Text>
        <Text style={styles.subText}>
          Please enter your email to reset your password.
        </Text>

        {/* Input container */}
        <View style={styles.inputContainer}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            left={<TextInput.Icon icon="email" />}
          />
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <TouchableOpacity
        onPress={handleRecovery}
        style={styles.button}
        activeOpacity={0.7}  
        >
        <Text style={styles.buttonText}>Send Reset Link</Text>
        </TouchableOpacity>


        <TouchableOpacity onPress={() => router.push("./Login")}>
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5", 
  },
  backgroundContainer: {
    height: 300, 
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
    justifyContent: "center",
    alignItems: "center",
    marginTop: -50,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 40,
    fontFamily: "Lilita", 
    color: "#68C2FF", 
    textAlign: "center",
    marginBottom: 20,
  },
  subText: {
    fontSize: 16,
    fontFamily: "Lato", 
    color: "#555",
    marginBottom: 20, 
    textAlign: "center",
  },
  inputContainer: {
    width: "90%",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    marginBottom: 15,
    fontFamily: "Lato", 
  },
  message: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 10,
  },
  button: {
    width: "90%",
    backgroundColor: "#EF5B5B",
    marginTop: 40,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  backText: {
    color: "#68C2FF",
    marginTop: 20,
    textAlign: "center",
  },
});
