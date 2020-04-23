import { TouchableWithoutFeedback, Keyboard } from "react-native";
import React from "react"

// Hides the keyboard when user clicks outside the view
export const DissmissKeyboard = ({ children }) => (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        {children}
    </TouchableWithoutFeedback>
)