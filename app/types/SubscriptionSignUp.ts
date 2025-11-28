export interface IUserRegistration {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    birthday: string; // Format: YYYY-MM-DD
    securityQuestionId: string;
    securityAnswer: string;
    subscriptionId: string;
    creditCardNumber: string;
    creditCardHolder: string;
    creditCardMonth: string; // Format: MM
    creditCardYear: string; // Format: YYYY
    creditCardCVV: string;
    billingAddress: string;
    billingAddress2: string;
    billingCity: string;
    billingZip: string;
    billingCountry: string;
    billingState: string;
    billingPhoneNumber: string;
    firstName: string;
    lastName: string;
    company: string;
    businessAddress: string;
    businessAddress2: string;
    businessCity: string;
    businessZip: string;
    businessCountry: string;
    businessState: string;
    businessWebsite: string;
    agreeToTerms: boolean;
    businessPhoneNumber: string;
  }
  