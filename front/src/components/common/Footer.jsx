import { useTranslation } from "react-i18next";

export default function Footer() {
  const { i18n } = useTranslation();
  const suffix = i18n.language === "fr" ? "_fr" : i18n.language === "ru" ? "_ru" : "";
  const privacyHref = `/privacy_policy${suffix}.html`;
  const termsHref = `/terms_of_service${suffix}.html`;

  return (
    <div className="fixed bottom-0 w-screen py-4 text-center text-sm text-white bg-transparent z-20 flex justify-center gap-5">
      <a href={privacyHref}>{i18n.t('footer.privacy_policy')}</a>
      <a href={termsHref}>{i18n.t('footer.terms_of_service')}</a>
    </div>
  );
}

