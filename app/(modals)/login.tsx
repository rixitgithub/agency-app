import React, { useState } from 'react';
import {
    View,
    Text,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    Image,
    Alert,
    ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import Checkbox from 'expo-checkbox';
import axios from 'axios';
import * as SecureStore from "expo-secure-store";
import { useGlobalContext } from '@/context/GlobalProvider';

const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const {setToken, setIsLogged} = useGlobalContext()

    const handleNext = async () => {
        setIsLoading(true);
        let data = {
            'password': password,
            'userName': username
        };
        try {
            const response = await axios.post(`${process.env.EXPO_PUBLIC_URL}/api/user/login`, data);
            await SecureStore.setItemAsync("access_token", response.data.authToken);
            setToken(response.data.authToken)
            setIsLogged(true)
            router.push("/");
        } catch (error) {
            console.log(error);
            Alert.alert("Login Failed", "Please check your credentials and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <Image style={styles.wave_image} source={require('@/assets/images/wave.png')} />

            <View style={{ marginTop: 150 }} >
                <Text style={styles.welcomeText}>Welcome</Text>
                <Text style={styles.welcomeText}>Back</Text>
            </View>

            <View style={styles.innerContainer} >
                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Username"
                        value={username}
                        onChangeText={setUsername}
                        style={styles.input}
                        placeholderTextColor="#FFFFFF"
                    />
                    <TextInput
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        style={styles.input}
                        placeholderTextColor="#FFFFFF"
                    />
                    <View style={styles.optionsContainer}>
                        <View style={styles.rememberMeContainer}>
                            <Checkbox
                                value={rememberMe}
                                onValueChange={setRememberMe}
                            />
                            <Text style={styles.rememberMeText}>Remember Me</Text>
                        </View>
                        <TouchableOpacity onPress={() => router.push("/(modals)/forgotPassword")} >
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity onPress={handleNext} style={styles.button} disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator color={Colors.primary} />
                    ) : (
                        <Text style={styles.buttonText}>Login</Text>
                    )}
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        marginTop: StatusBar.currentHeight,
        padding: 20,
    },
    innerContainer: {
        justifyContent: "space-around",
        alignItems: "center",
        width: "100%",
        flex: 1,
    },
    welcomeText: {
        color: "#10354B",
        fontSize: 32,
        fontWeight: '600',
    },
    inputContainer: {
        width: "100%",
    },
    wave_image: {
        width: "110%",
        position: "absolute",
        height: 300,
    },
    input: {
        borderWidth: 1,
        borderColor: "#86D0FB",
        borderRadius: 20,
        padding: 10,
        marginVertical: 10,
        width: "100%",
        backgroundColor: "#86D0FB",
        color: "#FFFFFF",
        paddingHorizontal: 20,
    },
    optionsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    rememberMeContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    rememberMeText: {
        marginLeft: 5,
    },
    forgotPasswordText: {
        color: Colors.primary,
    },
    button: {
        borderRadius: 30,
        borderWidth: 1,
        paddingVertical: 10,
        alignItems: "center",
        paddingHorizontal: 50,
        borderColor: Colors.primary,
        minWidth: 150,
    },
    buttonText: {
        fontSize: 21,
        color: Colors.primary,
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        marginVertical: 20,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: "#ccc",
    },
    dividerText: {
        marginHorizontal: 10,
        color: "#888",
    },
    socialContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    socialButton: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: "center",
    },
    socialButtonText: {
        fontSize: 16,
    },
    signUpContainer: {
        marginTop: 20,
        flexDirection: "row",
    },
    signUpText: {
        color: Colors.primary,
        fontSize: 14,
    },
});

export default LoginScreen;