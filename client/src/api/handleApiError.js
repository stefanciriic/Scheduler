const handleApiError = (error) => {
    if (error.response && error.response.data) {
        const { message, errors } = error.response.data;

        if (errors) {
            return Object.values(errors).join(" ");
        }

        if (message) {
            return message;
        }
    }
    return "An unexpected error occurred. Please try again.";
};

export default handleApiError;