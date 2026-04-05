import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: {
    translation: {
      "login.title": "Login",
      "login.dont_have_account": "You don't have any account ?",
      "login.forget_password": "You forget your password ?",
      "main_menu.edit_profile": "Edit profile",
      "main_menu.friends": "Friends",
      "main_menu.settings": "Settings",
      "main_menu.start_game": "Start Game"
    }
  },
  fr: {
    translation: {
      "login.title": "Connexion",
      "login.dont_have_account": "Vous n'avez pas de compte ?",
      "login.forget_password": "Vous avez oublié votre mot de passe ?",
      "main_menu.edit_profile": "Modifier le profil",
      "main_menu.friends": "Amis",
      "main_menu.settings": "Paramètres",
      "main_menu.start_game": "Démarrer le jeu"
    }
  },
  ru: {
    translation: {
      "login.title": "Вход",
      "login.dont_have_account": "У вас нет аккаунта ?",
      "login.forget_password": "Вы забыли пароль ?",
      "main_menu.edit_profile": "Редактировать профиль",
      "main_menu.friends": "Друзья",
      "main_menu.settings": "Настройки",
      "main_menu.start_game": "Начать игру"
    }
  }

};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en", // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

  export default i18n;