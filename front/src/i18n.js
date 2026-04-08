import i18n from "i18next";
import { initReactI18next } from "react-i18next";

function getInitialLanguage() {
  try {
    const raw = localStorage.getItem("settings-storage");
    if (!raw) return "en";

    const parsed = JSON.parse(raw);
    const language = parsed?.state?.language;
    if (language === "en" || language === "fr" || language === "ru") {
      return language;
    }
  } catch (err) {
  }

  return "en";
}

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: {
    translation: {
      // Login 
      "login.title": "Login",
      "login.login_with_google": "Login with Google",
      "login.login_with_42": "Login with 42",
      "login.redirecting_to_42": "Redirecting to 42 auth...",
      "login.dont_have_account": "You don't have any account ?",
      "login.forget_password": "You forget your password ?",
      "login.username": "Username",
      "login.password": "Password",
      "login.error_occurred": "An error occurred",

      // Register
      "register.title": "Register",
      "register.registration_succeeded": "Registration succeeded !",
      "register.go_to_login": "Go to login",
      "register.username": "Username",
      "register.email": "Email",
      "register.password": "Password",
      "register.have_account": "You have an account ?",
      "register.login_here": "Login here",

      // RestorePassword
      "restore_password.title": "Request Password Reset",
      "restore_password.reset_link_sent": "If email exists, reset link sent",
      "restore_password.login": "Login",
      "restore_password.email": "Email",
      "restore_password.send_link": "Send link",
      "restore_password.have_account": "You have an account ?",
      "restore_password.login_here": "Login here",
      "restore_password.no_account": "You don't have an account ?",
      "restore_password.register_here": "Register here",

      // main menu
      "main_menu.edit_profile": "Edit profile",
      "main_menu.friends": "Friends",
      "main_menu.settings": "Settings",
      "main_menu.start_game": "Start Game",

      // FriendsPanel 
      "friends_panel.title": "Friends",
      "friends_panel.no_friends": "No friends",
      "friends_panel.edit_friends": "Edit Friends",

      // ChatWindow 
      "chat_window.type_message": "Type your message...",

      // OtpDialog 
      "otp_dialog.scan_qr": "Scan QR Code by Google Authenticator",
      "otp_dialog.open_authenticator_enter_code": "Open Google Authenticator and enter the code:",
      "otp_dialog.ok": "OK",

      // components
      "dialog.close": "Close",

      // Settings 
      "settings.ip_address.title": "Game server IP address or domain",
      "settings.save": "Save",
      "settings.ip_address.updated": "Server address updated.",

      // EditProfile 
      "edit_profile.server_connection_error": "Check server connection. Server address in settings.",
      "edit_profile.error_code": "Error",
      "edit_profile.two_factor_authentication": "Two Factor Authentication",
      "edit_profile.upload_avatar": "Upload Avatar",
      "edit_profile.upload_avatar_failed": "Failed to upload avatar",

      // EditFriends
      "edit_friends.server_connection_error": "Check server connection. Server address in settings.",
      "edit_friends.error_code": "Error",
      "edit_friends.all_users": "All Users:",
      "edit_friends.search_user": "Search for a user...",
      "edit_friends.accepted_error": "ERROR! accepted",
      "edit_friends.invitation_sent": "invitation sent",
      "edit_friends.delete_invitation": "delete invitation",
      "edit_friends.send_friend_request": "Send friend request",
      "edit_friends.friends": "Friends:",
      "edit_friends.delete_friend": "delete friend",
      "edit_friends.add_some_friends": "Add some friends from from All Users !",
      "edit_friends.waiting_for_approval": "Waiting for Approval:",
      "edit_friends.accept_invitation": "accept invitation",
      "edit_friends.friendship_requests_here": "Friendship requests will appear here",

      // GameMain 
      "game_main.server_connection_error": "Check server connection. Server address in settings.",
      "game_main.error_code": "Error",
      "game_main.loading": "Loading...",
      "game_main.pause_click_resume": "PAUSE - Click to resume",

      // NotFound 
      "not_found.page_not_found": "Page not found",
      "not_found.to_main_page": "To main page",

      // OAuth 
      "oauth.logging_in": "Logging in...",

      // VIewProfile
      "view_profile.loading": "Loading...",
      "view_profile.user_not_found": "User not found",

      // Matches
      "matches.open_matches": "Open matches",
      "matches.my_match": "My match",
      "matches.create_match": "Create match",
      "matches.players_maxcount": "Max players",
      "matches.time_limit": "Time limit",
      "matches.create_match_error": "Failed to create match",
      "matches.delete_my_match": "Delete my match",

      "footer.privacy_policy": "Privacy Policy",
      "footer.terms_of_service": "Terms of Service"
    }
  },
  fr: {
    translation: {
      // Login 
      "login.title": "Connexion",
      "login.login_with_google": "Se connecter avec Google",
      "login.dont_have_account": "Vous n'avez pas de compte ?",
      "login.forget_password": "Vous avez oublié votre mot de passe ?",
      "login.login_with_42": "Se connecter avec 42",
      "login.redirecting_to_42": "Redirection vers l'authentification 42...",
      "login.username": "Nom d'utilisateur",
      "login.password": "Mot de passe",
      "login.error_occurred": "Une erreur est survenue",

      // Register
      "register.title": "Inscription",
      "register.registration_succeeded": "Inscription reussie !",
      "register.go_to_login": "Aller a la connexion",
      "register.username": "Nom d'utilisateur",
      "register.email": "Email",
      "register.password": "Mot de passe",
      "register.have_account": "Vous avez un compte ?",
      "register.login_here": "Connectez-vous ici",

      // RestorePassword 
      "restore_password.title": "Demander la reinitialisation du mot de passe",
      "restore_password.reset_link_sent": "Si l'email existe, le lien de reinitialisation a ete envoye",
      "restore_password.login": "Connexion",
      "restore_password.email": "Email",
      "restore_password.send_link": "Envoyer le lien",
      "restore_password.have_account": "Vous avez un compte ?",
      "restore_password.login_here": "Connectez-vous ici",
      "restore_password.no_account": "Vous n'avez pas de compte ?",
      "restore_password.register_here": "Inscrivez-vous ici",

      // main menu
      "main_menu.edit_profile": "Modifier le profil",
      "main_menu.friends": "Amis",
      "main_menu.settings": "Paramètres",
      "main_menu.start_game": "Démarrer le jeu",

      // FriendsPanel 
      "friends_panel.title": "Amis",
      "friends_panel.no_friends": "Aucun ami",
      "friends_panel.edit_friends": "Modifier les amis",

      // ChatWindow 
      "chat_window.type_message": "Ecrivez votre message...",

      // OtpDialog 
      "otp_dialog.scan_qr": "Scannez le QR code avec Google Authenticator",
      "otp_dialog.open_authenticator_enter_code": "Ouvrez Google Authenticator et saisissez le code :",
      "otp_dialog.ok": "OK",

      // Shared components
      "dialog.close": "Fermer",

      // Settings 
      "settings.ip_address.title": "Adresse IP du serveur de jeu ou domaine",
      "settings.save": "Enregistrer",
      "settings.ip_address.updated": "Adresse du serveur mise a jour.",

      // EditProfile 
      "edit_profile.server_connection_error": "Verifiez la connexion au serveur. L'adresse du serveur est dans les parametres.",
      "edit_profile.error_code": "Erreur",
      "edit_profile.two_factor_authentication": "Authentification a deux facteurs",
      "edit_profile.upload_avatar": "Televerser l'avatar",
      "edit_profile.upload_avatar_failed": "Echec du televersement de l'avatar",

      // EditFriends 
      "edit_friends.server_connection_error": "Verifiez la connexion au serveur. L'adresse du serveur est dans les parametres.",
      "edit_friends.error_code": "Erreur",
      "edit_friends.all_users": "Tous les utilisateurs :",
      "edit_friends.search_user": "Rechercher un utilisateur...",
      "edit_friends.accepted_error": "ERREUR ! accepte",
      "edit_friends.invitation_sent": "invitation envoyee",
      "edit_friends.delete_invitation": "supprimer l'invitation",
      "edit_friends.send_friend_request": "Envoyer une demande d'ami",
      "edit_friends.friends": "Amis :",
      "edit_friends.delete_friend": "supprimer l'ami",
      "edit_friends.add_some_friends": "Ajoutez des amis depuis Tous les utilisateurs !",
      "edit_friends.waiting_for_approval": "En attente d'approbation :",
      "edit_friends.accept_invitation": "accepter l'invitation",
      "edit_friends.friendship_requests_here": "Les demandes d'amitie apparaitront ici",

      // GameMain 
      "game_main.server_connection_error": "Verifiez la connexion au serveur. L'adresse du serveur est dans les parametres.",
      "game_main.error_code": "Erreur",
      "game_main.loading": "Chargement...",
      "game_main.pause_click_resume": "PAUSE - Cliquez pour reprendre",

      // NotFound 
      "not_found.page_not_found": "Page introuvable",
      "not_found.to_main_page": "Vers la page principale",

      // OAuth 
      "oauth.logging_in": "Connexion en cours...",

      // VIewProfile 
      "view_profile.loading": "Chargement...",
      "view_profile.user_not_found": "Utilisateur introuvable",

      // Matches
      "matches.open_matches": "Matchs ouverts",
      "matches.my_match": "Mon match",
      "matches.create_match": "Creer un match",
      "matches.players_maxcount": "Nombre max de joueurs",
      "matches.time_limit": "Limite de temps",
      "matches.create_match_error": "Echec de la creation du match",
      "matches.delete_my_match": "Supprimer mon match",

      "footer.privacy_policy": "Politique de confidentialité",
      "footer.terms_of_service": "Conditions d'utilisation"
    }
  },
  ru: {
    translation: {
      // Login 
      "login.title": "Вход",
      "login.login_with_google": "Войти с помощью Google",
      "login.login_with_42": "Войти с помощью 42",
      "login.redirecting_to_42": "Перенаправление на аутентификацию 42...",
      "login.forget_password": "Вы забыли пароль ?",
      "login.dont_have_account": "У вас нет аккаунта ?",
      "login.username": "Имя пользователя",
      "login.password": "Пароль",
      "login.error_occurred": "Произошла ошибка",

      // Register 
      "register.title": "Регистрация",
      "register.registration_succeeded": "Регистрация прошла успешно !",
      "register.go_to_login": "Перейти ко входу",
      "register.username": "Имя пользователя",
      "register.email": "Email",
      "register.password": "Пароль",
      "register.have_account": "У вас есть аккаунт ?",
      "register.login_here": "Войти здесь",

      // RestorePassword 
      "restore_password.title": "Запрос восстановления пароля",
      "restore_password.reset_link_sent": "Если email существует, ссылка отправлена",
      "restore_password.login": "Вход",
      "restore_password.email": "Email",
      "restore_password.send_link": "Отправить ссылку",
      "restore_password.have_account": "У вас есть аккаунт ?",
      "restore_password.login_here": "Войти здесь",
      "restore_password.no_account": "У вас нет аккаунта ?",
      "restore_password.register_here": "Зарегистрироваться здесь",

      // main menu
      "main_menu.edit_profile": "Редактировать профиль",
      "main_menu.friends": "Друзья",
      "main_menu.settings": "Настройки",
      "main_menu.start_game": "Начать игру",

      // FriendsPanel 
      "friends_panel.title": "Друзья",
      "friends_panel.no_friends": "Нет друзей",
      "friends_panel.edit_friends": "Редактировать друзей",

      // ChatWindow 
      "chat_window.type_message": "Введите сообщение...",

      // OtpDialog 
      "otp_dialog.scan_qr": "Сканируйте QR-код в Google Authenticator",
      "otp_dialog.open_authenticator_enter_code": "Откройте Google Authenticator и введите код:",
      "otp_dialog.ok": "OK",

      // Shared  components
      "dialog.close": "Закрыть",

      // Settings 
      "settings.ip_address.title": "IP адрес или домен игрового сервера",
      "settings.save": "Сохранить",
      "settings.ip_address.updated": "Адрес сервера обновлен.",

      // EditProfile 
      "edit_profile.server_connection_error": "Проверьте подключение к серверу. Адрес сервера указан в настройках.",
      "edit_profile.error_code": "Ошибка",
      "edit_profile.two_factor_authentication": "Двухфакторная аутентификация",
      "edit_profile.upload_avatar": "Загрузить аватар",
      "edit_profile.upload_avatar_failed": "Не удалось загрузить аватар",

      // EditFriends 
      "edit_friends.server_connection_error": "Проверьте подключение к серверу. Адрес сервера указан в настройках.",
      "edit_friends.error_code": "Ошибка",
      "edit_friends.all_users": "Все пользователи:",
      "edit_friends.search_user": "Поиск пользователя...",
      "edit_friends.accepted_error": "ОШИБКА! принято",
      "edit_friends.invitation_sent": "приглашение отправлено",
      "edit_friends.delete_invitation": "удалить приглашение",
      "edit_friends.send_friend_request": "Отправить запрос в друзья",
      "edit_friends.friends": "Друзья:",
      "edit_friends.delete_friend": "удалить друга",
      "edit_friends.add_some_friends": "Добавьте друзей из списка всех пользователей!",
      "edit_friends.waiting_for_approval": "Ожидают подтверждения:",
      "edit_friends.accept_invitation": "принять приглашение",
      "edit_friends.friendship_requests_here": "Запросы в друзья появятся здесь",

      // GameMain 
      "game_main.server_connection_error": "Проверьте подключение к серверу. Адрес сервера указан в настройках.",
      "game_main.error_code": "Ошибка",
      "game_main.loading": "Загрузка...",
      "game_main.pause_click_resume": "ПАУЗА - Нажмите, чтобы продолжить",

      // NotFound 
      "not_found.page_not_found": "Страница не найдена",
      "not_found.to_main_page": "На главную страницу",

      // OAuth 
      "oauth.logging_in": "Вход...",

      // VIewProfile 
      "view_profile.loading": "Загрузка...",
      "view_profile.user_not_found": "Пользователь не найден",

      // Matches
      "matches.open_matches": "Открытые матчи",
      "matches.my_match": "Мой матч",
      "matches.create_match": "Создать матч",
      "matches.players_maxcount": "Максимум игроков",
      "matches.time_limit": "Лимит времени",
      "matches.create_match_error": "Не удалось создать матч",
      "matches.delete_my_match": "Удалить мой матч",

      "footer.privacy_policy": "Политика конфиденциальности",
      "footer.terms_of_service": "Условия использования"
    }
  }

};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: getInitialLanguage(), // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

  export default i18n;