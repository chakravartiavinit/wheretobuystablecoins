export const mockWaitlistSubmit = async (email) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('Mock waitlist submission for:', email);

    return {
        success: true,
        message: 'Successfully joined the waitlist!',
    };
};
