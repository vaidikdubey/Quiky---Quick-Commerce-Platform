import { cn } from "../lib/utils.js";
import React from "react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error, errInfo) {
        console.log("Error boundary caught an error: ", error);
        console.error(errInfo);
    }

    render() {
        const isDark = localStorage.getItem("theme") === "dark";

        if (this.state.hasError) {
            return (
                <>
                    <div
                        className={cn(
                            "h-full w-full flex flex-col justify-center items-center gap-3 cursor-none px-5",
                            isDark
                                ? "bg-zinc-950 text-zinc-100"
                                : "bg-white text-zinc-900",
                        )}
                    >
                        <h2 className="text-2xl text-center md:text-4xl font-semibold">
                            Well... that's not supposed to happen!
                        </h2>
                        <p className="text-sm text-center md:text-lg">
                            A tiny bug sneaked in where it wasn't invited.{" "}
                            <br />
                            We're on it.
                        </p>

                        <button
                            onClick={() => window.location.reload()}
                            className={cn(
                                "h-10 w-32 md:h-15 md:w-40 my-5 text-md md:text-xl font-semibold cursor-none",
                            )}
                        >
                            Reload Page
                        </button>
                    </div>
                </>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
