import { Component, type ErrorInfo, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";

type Props = {
  children: ReactNode;
  onError?: (message: string) => void;
};

type State = {
  message: string | null;
};

export class ModelErrorBoundary extends Component<Props, State> {
  state: State = { message: null };

  static getDerivedStateFromError(error: Error): State {
    return { message: error.message || "Failed to render 3D model" };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error.message);
    console.error("[3D Model]", error.message, info.componentStack);
  }

  render() {
    if (this.state.message) {
      return (
        <View style={styles.wrap}>
          <Text style={styles.text}>{this.state.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#1a1f1c",
  },
  text: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 22,
  },
});
