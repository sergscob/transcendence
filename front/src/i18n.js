import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: {
    translation: {
      "login.title": "Login",
      "login.login_with_google": "Login with Google",
      "login.login_with_42": "Login with 42",
      "login.redirecting_to_42": "Redirecting to 42 auth...",
      "login.dont_have_account": "You don't have any account ?",
      "login.forget_password": "You forget your password ?",
      "login.username": "Username",
      "login.password": "Password",

      "main_menu.edit_profile": "Edit profile",
      "main_menu.friends": "Friends",
      "main_menu.settings": "Settings",
      "main_menu.start_game": "Start Game",
      
      "settings.ip_address.title": "Game server IP address",
      "settings.save": "Save"
    }
  },
  fr: {
    translation: {
      "login.title": "Connexion",
      "login.login_with_google": "Se connecter avec Google",
      "login.dont_have_account": "Vous n'avez pas de compte ?",
      "login.forget_password": "Vous avez oublié votre mot de passe ?",
      "login.login_with_42": "Se connecter avec 42",
      "login.redirecting_to_42": "Redirection vers l'authentification 42...",
      "login.username": "Nom d'utilisateur",
      "login.password": "Mot de passe",

      "main_menu.edit_profile": "Modifier le profil",
      "main_menu.friends": "Amis",
      "main_menu.settings": "Paramètres",
      "main_menu.start_game": "Démarrer le jeu",

      "settings.ip_address.title": "Adresse IP du serveur de jeu",
      "settings.save": "Enregistrer"
    }
  },
  ru: {
    translation: {
      "login.title": "Вход",
      "login.login_with_google": "Войти с помощью Google",
      "login.login_with_42": "Войти с помощью 42",
      "login.redirecting_to_42": "Перенаправление на аутентификацию 42...",
      "login.forget_password": "Вы забыли пароль ?",
      "login.dont_have_account": "У вас нет аккаунта ?",
      "login.username": "Имя пользователя",
      "login.password": "Пароль",

      "main_menu.edit_profile": "Редактировать профиль",
      "main_menu.friends": "Друзья",
      "main_menu.settings": "Настройки",
      "main_menu.start_game": "Начать игру",

      "settings.ip_address.title": "IP адрес игрового сервера",
      "settings.save": "Сохранить"
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