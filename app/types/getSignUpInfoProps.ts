export interface SignUpInfoResponse {
  HintQuestionsList: HintQuestionSignUp[];
  CountryList: CountrySignUp[];
  Categories: CategorySignUp[];
  States: StateSignUp[];
}

export interface HintQuestionSignUp {
  Id: number;
  Question: string;
}

export interface StateSignUp {
  Abbreviation: string;
  State: string;
}

export interface CountrySignUp {
  Id: number;
  Name: string;
  PhoneMask: string;
}

export interface CategorySignUp {
  id: number;
  name: string;
  isActive: boolean;
  children: SubcategorySignUp[];
}

export interface SubcategorySignUp {
  id: number;
  name: string;
  isActive: boolean;
}

export interface SignUpFormType {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  phoneNumber: string;
  selectedSubcategories: (number | string)[];
  username: string;
  password: string;
  confirmPassword: string;
  securityQuestionId: string;
  securityAnswer: string;
  birthday: Date;
  agreeToTerms: boolean;
}
