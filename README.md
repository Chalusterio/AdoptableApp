# Para makuha ang value sa user from SignUp to Options 

## 1. Signup Page
router.push({
      pathname: 'Options', 
      params: { userName: name }, // Passing 'name' as 'userName'
    });

## e add na nga code sa button to navigate sa Options page which is kani ang whole code pero kana ra taas ang important para ma pass ang value
const handleSignup = () => {
    if (!validateInputs()) return;

    const userData = { name, email, contactNumber, password };
    console.log("User data:", userData);

    setDialogVisible(true);
    setName("");
    setEmail("");
    setContactNumber("");
    setPassword("");
    
    // Pass the name to the Options screen using query parameters
    router.push({
      pathname: 'Options', 
      params: { userName: name }, // Passing 'name' as 'userName'
    });
  };

## 2. Options Page
import { useRouter, useLocalSearchParams  } from 'expo-router';

## 3. declare
const { userName } = useLocalSearchParams(); // Retrieves 'userName' from search params

## 4. e ana ang text
<Text style={styles.greetingsText}>Hello, {userName || "User"}!</Text>
