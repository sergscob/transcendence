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
      "main_menu.open_matches": "Open matches",
      "main_menu.statistics": "Statistics",
      "main_menu.game_rules": "Game Rules",

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
      "edit_profile.edit_profile": "Edit Profile",
      "edit_profile.user_name": "User Name",
      "edit_profile.server_connection_error": "Check server connection. Server address in settings.",
      "edit_profile.error_code": "Error",
      "edit_profile.ask_two_factor_authentication": "Two Factor Authentication",
      "edit_profile.two_factor_authentication": "Two Factor Authentication",
      "edit_profile.ask_upload_avatar": "Upload Avatar",
      "edit_profile.upload_avatar": "Upload Avatar",
      "edit_profile.upload_avatar_failed": "Failed to upload avatar",
      "edit_profile.profile_updated": "Profile updated",

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
      "edit_friends.add_some_friends": "Add some friends from All Users !",
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
      "view_profile.total_matches": "Total matches",
      "view_profile.wins": "Wins",
      "view_profile.losses": "Losses",
      "view_profile.score": "Score",
      "view_profile.email": "Email",
      "view_profile.place": "Place",

      // TotalStat
      "total_stat.title": "Total stats",
      "total_stat.place": "Place",
      "total_stat.player": "Player",
      "total_stat.total_matches": "Total matches",
      "total_stat.wins": "Wins",
      "total_stat.score": "Score",
      "total_stat.load_more": "Load more",
      "total_stat.page_info": "Page {{current}} of {{total}}",
      "total_stat.next": "Next",
      "total_stat.previous": "Previous",

      // Rules
      "rules.server_connection_error": "Check server connection. Server address in settings.",
      "rules.error_code": "Error",
      "rules.objective": "The Objective",
      "rules.objective_content": "Welcome to the arena. You are dropping into a fast-paced, close-quarters deathmatch against up to 9 other online players. There are no teams and no second chances. Your only goal: be the last player standing.",
      "rules.loadout": "Loadout & Lives",
      "rules.loadout_lives_title": "Lives",
      "rules.loadout_lives_content": "You start with 100 hp. Once you lose them all, you are eliminated from the match",
      "rules.loadout_ammo_title": "Ammo",
      "rules.loadout_ammo_content": "You drop in with only 10 rounds of ammunition. Once you finished them you can reload indefinetly. Make every single shot count!",
      "rules.loadout_lobby_title": "Lobby Size",
      "rules.loadout_lobby_content": " Matches are capped at a maximum of 10 players to keep the chaos contained.",
      "rules.controls": "Controls",
      "rules.controls_wasd": "W, A, S, D",
      "rules.controls_spacebar": "Spacebar",
      "rules.controls_leftclick": "Left Click",
      "rules.controls_movements": "Move around the arena.",
      "rules.controls_jump": "Jump to dodge fire or reach higher grounds.",
      "rules.controls_shoot": "Fire your weapon.",
      "rules.multiplayer": "Multiplayer",
      "rules.multiplayer_serversetup": "Server Setup",
      "rules.multiplayer_serversetup_content": "To play with a friend, you need to connect to their server. Go to your Settings and enter their specific IP address and Port number.",
      "rules.multiplayer_createroom": "Create a room",
      "rules.multiplayer_createroom_content": 'One player must act as the host. Navigate to the "Open Matches" menu and create a new room, specifying the number of players needed for the match.',
      "rules.multiplayer_joinmatch": "Join the match",
      "rules.multiplayer_joinmatch_content": 'All other players can then open their "Open Matches" menu and join the hosts room.',
      "rules.multiplayer_startgame": "Start the game",
      "rules.multiplayer_startgame_content": "The match will begin automatically as soon as the room reaches the required number of players",
      "rules.interface": "Interface",
      "rules.interface_content": "Keep your eyes on the interface to survive the arena. Reading from left to right, you'll first see your Health (HP), which dictates how much damage you can take. Next is your Arms indicator, showing your current ammo. Further right, you'll find your current match Score, followed by the Time Left on the clock. Finally, the far right displays the total number of Players currently in the game.",

      // Matches
      "matches.open_matches": "Open matches",
      "matches.my_match": "My match",
      "matches.create_match": "Create match",
      "matches.refresh_match": "Refresh",
      "matches.players_maxcount": "Players count",
      "matches.time_limit": "Time limit",
      "matches.create_match_error": "Failed to create match",
      "matches.delete_my_match": "Delete my match",
      "matches.you_are_in_a_match": "You are in a match",
      "matches.go_to_match": "Go to match",
      "matches.players": "Players",
      "matches.creator": "Creator",
      "matches.status": "Status",
      "matches.created_at": "Created at",
      "matches.started_at": "Started at",
      "matches.actions": "Actions",
      "matches.leave_match": "Leave match",
      "matches.join": "Join",
      "matches.status_waiting": "Waiting",
      "matches.status_live": "Live",
      "matches.status_finished": "Finished",
      "matches.status_canceled": "Canceled",

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
      "main_menu.open_matches": "Ouvrir les matchs",
      "main_menu.statistics": "Statistiques",
      "main_menu.game_rules": "Regles du jeu",

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
      "edit_profile.edit_profile": "Modifier le profil",
      "edit_profile.user_name": "Nom d'utilisateur",
      "edit_profile.server_connection_error": "Verifiez la connexion au serveur. L'adresse du serveur est dans les parametres.",
      "edit_profile.error_code": "Erreur",
      "edit_profile.ask_two_factor_authentication": "L'authentification a deux facteurs",
      "edit_profile.two_factor_authentication": "Authentification a deux facteurs",
      "edit_profile.ask_upload_avatar": "Téléverser un avatar",
      "edit_profile.upload_avatar": "Téléverser l'avatar",
      "edit_profile.upload_avatar_failed": "Échec du téléversement de l'avatar",
      "edit_profile.profile_updated": "Profil mis à jour",

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
      "view_profile.total_matches": "Matchs joues",
      "view_profile.wins": "Victoires",
      "view_profile.losses": "Defaites",
      "view_profile.score": "Score",
      "view_profile.email": "Email",
      "view_profile.place": "Place",

      // TotalStat
      "total_stat.title": "Statistiques totales",
      "total_stat.place": "Place",
      "total_stat.player": "Joueur",
      "total_stat.total_matches": "Matchs joues",
      "total_stat.wins": "Victoires",
      "total_stat.score": "Score",
      "total_stat.load_more": "Charger plus",
      "total_stat.page_info": "Page {{current}} de {{total}}",
      "total_stat.next": "Suivant",
      "total_stat.previous": "Précédent",

      //Rules
      "rules.server_connection_error": "Vérifiez la connexion au serveur. L'adresse du serveur se trouve dans les paramètres.",
      "rules.error_code": "Erreur",
      "rules.objective": "L'Objectif",
      "rules.objective_content": "Bienvenue dans l'arène. Vous êtes plongé dans un match à mort frénétique et rapproché contre jusqu'à 9 autres joueurs en ligne. Il n'y a pas d'équipes et pas de secondes chances. Votre seul but : être le dernier joueur en vie.",
      "rules.loadout": "Équipement et Vies",
      "rules.loadout_lives_title": "Vies",
      "rules.loadout_lives_content": "Vous commencez avec 100 PV. Une fois que vous les avez tous perdus, vous êtes éliminé de la partie.", "rules.loadout_ammo_title": "Munitions",
      "rules.loadout_ammo_content": "Vous êtes déployé avec seulement 10 munitions. Une fois épuisées, vous pouvez recharger à l'infini. Faites en sorte que chaque tir compte !", "rules.loadout_lobby_title": "Taille du Salon",
      "rules.loadout_lobby_content": "Les matchs sont limités à un maximum de 10 joueurs pour contenir le chaos.",
      "rules.controls": "Commandes",
      "rules.controls_wasd": "W, A, S, D",
      "rules.controls_spacebar": "Barre d'espace",
      "rules.controls_leftclick": "Clic gauche",
      "rules.controls_movements": "Se déplacer dans l'arène.",
      "rules.controls_jump": "Sautez pour esquiver les tirs ou atteindre des zones surélevées.",
      "rules.controls_shoot": "Tirez avec votre arme.",
      "rules.multiplayer": "Multijoueur",
      "rules.multiplayer_serversetup": "Configuration du Serveur",
      "rules.multiplayer_serversetup_content": "Pour jouer avec un ami, vous devez vous connecter à son serveur. Allez dans vos Paramètres et entrez son adresse IP spécifique et son numéro de Port.",
      "rules.multiplayer_createroom": "Créer un salon",
      "rules.multiplayer_createroom_content": "Un joueur doit agir en tant qu'hôte. Naviguez jusqu'au menu \"Matchs Ouverts\" et créez un nouveau salon, en spécifiant le nombre de joueurs nécessaires pour le match.",
      "rules.multiplayer_joinmatch": "Rejoindre le match",
      "rules.multiplayer_joinmatch_content": "Tous les autres joueurs peuvent ensuite ouvrir leur menu \"Matchs Ouverts\" et rejoindre le salon de l'hôte.",
      "rules.multiplayer_startgame": "Démarrer la partie",
      "rules.multiplayer_startgame_content": "Le match commencera automatiquement dès que le salon atteindra le nombre de joueurs requis.",
      "rules.interface": "Interface",
      "rules.interface_content": "Gardez un œil sur l'interface pour survivre dans l'arène. De gauche à droite, vous verrez d'abord votre Santé (PV), qui indique la quantité de dégâts que vous pouvez subir. Ensuite, l'indicateur d'Armes affiche vos munitions actuelles. Plus à droite, vous trouverez votre Score de match actuel, suivi du Temps Restant au chronomètre. Enfin, tout à droite, s'affiche le nombre total de Joueurs actuellement dans la partie.",

      // Matches
      "matches.open_matches": "Matchs ouverts",
      "matches.my_match": "Mon match",
      "matches.create_match": "Creer un match",
      "matches.refresh_match": "Rafraichir",
      "matches.players_maxcount": "Nombre de joueurs",
      "matches.time_limit": "Limite de temps",
      "matches.create_match_error": "Echec de la creation du match",
      "matches.delete_my_match": "Supprimer mon match",
      "matches.you_are_in_a_match": "Vous etes dans un match",
      "matches.go_to_match": "Aller au match",
      "matches.players": "Joueurs",
      "matches.creator": "Createur",
      "matches.status": "Statut",
      "matches.created_at": "Cree le",
      "matches.started_at": "Commence le",
      "matches.actions": "Actions",
      "matches.leave_match": "Quitter le match",
      "matches.join": "Rejoindre",
      "matches.status_waiting": "En attente",
      "matches.status_live": "En cours",
      "matches.status_finished": "Termine",
      "matches.status_canceled": "Annule",

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
      "main_menu.open_matches": "Открыть матчи",
      "main_menu.statistics": "Статистика",
      "main_menu.game_rules": "Правила Игры",

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
      "edit_profile.edit_profile": "Редактировать профиль",
      "edit_profile.user_name": "Имя пользователя",
      "edit_profile.server_connection_error": "Проверьте подключение к серверу. Адрес сервера указан в настройках.",
      "edit_profile.error_code": "Ошибка",
      "edit_profile.ask_two_factor_authentication": "Двухфакторная аутентификация",
      "edit_profile.two_factor_authentication": "Двухфакторная аутентификация",
      "edit_profile.ask_upload_avatar": "Загрузить аватар",
      "edit_profile.upload_avatar": "Загрузить аватар",
      "edit_profile.upload_avatar_failed": "Не удалось загрузить аватар",
      "edit_profile.profile_updated": "Профиль обновлен",

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
      "view_profile.total_matches": "Всего матчей",
      "view_profile.wins": "Победы",
      "view_profile.losses": "Поражения",
      "view_profile.score": "Очки",
      "view_profile.email": "Почта",
      "view_profile.place": "Место",

      // TotalStat
      "total_stat.title": "Общая статистика",
      "total_stat.place": "Место",
      "total_stat.player": "Игрок",
      "total_stat.total_matches": "Всего матчей",
      "total_stat.wins": "Победы",
      "total_stat.score": "Очки",
      "total_stat.load_more": "Загрузить еще",
      "total_stat.page_info": "Страница {{current}} из {{total}}",
      "total_stat.next": "Следующая",
      "total_stat.previous": "Предыдущая",

      //Rules
      "rules.server_connection_error": "Проверьте подключение к серверу. Адрес сервера находится в настройках.",
      "rules.error_code": "Ошибка",
      "rules.objective": "Цель",
      "rules.objective_content": "Добро пожаловать на арену. Вы вступаете в динамичный ближний бой насмерть против 9 других игроков онлайн. Здесь нет команд и вторых шансов. Ваша единственная цель — остаться последним выжившим.",
      "rules.loadout": "Снаряжение и жизни",
      "rules.loadout_lives_title": "Жизни",
      "rules.loadout_lives_content": "Вы начинаете со 100 ОЗ. Как только вы потеряете их все, вы выбываете из матча.", "rules.loadout_ammo_title": "Боеприпасы",
      "rules.loadout_ammo_content": "Вы появляетесь в игре всего с 10 патронами. Как только они закончатся, вы сможете перезаряжаться бесконечно. Пусть каждый выстрел будет на счету!", "rules.loadout_lobby_title": "Размер лобби",
      "rules.loadout_lobby_content": "Матчи ограничены максимум 10 игроками, чтобы контролировать хаос.",
      "rules.controls": "Управление",
      "rules.controls_wasd": "W, A, S, D",
      "rules.controls_spacebar": "Пробел",
      "rules.controls_leftclick": "Левая кнопка мыши",
      "rules.controls_movements": "Перемещение по арене.",
      "rules.controls_jump": "Прыжок, чтобы уклониться от огня или занять возвышенность.",
      "rules.controls_shoot": "Стрельба из оружия.",
      "rules.multiplayer": "Мультиплеер",
      "rules.multiplayer_serversetup": "Настройка сервера",
      "rules.multiplayer_serversetup_content": "Чтобы играть с другом, вам нужно подключиться к его серверу. Перейдите в Настройки и введите его IP-адрес и номер порта.",
      "rules.multiplayer_createroom": "Создать комнату",
      "rules.multiplayer_createroom_content": "Один игрок должен стать хостом. Перейдите в меню «Открытые матчи» и создайте новую комнату, указав необходимое количество игроков для матча.",
      "rules.multiplayer_joinmatch": "Присоединиться к матчу",
      "rules.multiplayer_joinmatch_content": "Все остальные игроки могут затем открыть меню «Открытые матчи» и присоединиться к комнате хоста.",
      "rules.multiplayer_startgame": "Начать игру",
      "rules.multiplayer_startgame_content": "Матч начнется автоматически, как только в комнате наберется необходимое количество игроков.",
      "rules.interface": "Интерфейс",
      "rules.interface_content": "Следите за интерфейсом, чтобы выжить на арене. Слева направо: сначала вы увидите свое Здоровье (ОЗ), которое определяет, сколько урона вы можете выдержать. Далее идет индикатор Оружия, показывающий ваши текущие боеприпасы. Еще правее вы найдете свой текущий Счет в матче, за которым следует Оставшееся время. Наконец, в крайнем правом углу отображается общее количество Игроков, находящихся в данный момент в игре.",


      // Matches
      "matches.open_matches": "Открытые матчи",
      "matches.my_match": "Мой матч",
      "matches.create_match": "Создать матч",
	  "matches.refresh_match": "Обновить",
      "matches.players_maxcount": "Количество игроков",
      "matches.time_limit": "Лимит времени",
      "matches.create_match_error": "Не удалось создать матч",
      "matches.delete_my_match": "Удалить мой матч",
      "matches.you_are_in_a_match": "Вы уже в матче",
      "matches.go_to_match": "Перейти к матчу",
      "matches.players": "Игроки",
      "matches.creator": "Создатель",
      "matches.status": "Статус",
      "matches.created_at": "Создан",
      "matches.started_at": "Начат",
      "matches.actions": "Действия",
      "matches.leave_match": "Покинуть матч",
      "matches.join": "Присоединиться",
      "matches.status_waiting": "Ожидание",
      "matches.status_live": "В процессе",
      "matches.status_finished": "Завершен",
      "matches.status_canceled": "Отменен",

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
