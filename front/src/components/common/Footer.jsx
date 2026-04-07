import { useTranslation } from "react-i18next";

export default function Footer() {
  const { i18n } = useTranslation();

  return (
    <div className="fixed bottom-0 w-screen px-20 py-4 text-center text-sm text-gray-500 bg-gray-100">
      <a href="/privacy_policy.html" className="mr-20">{i18n.t('footer.privacy_policy')}</a>
      <a href="/terms_of_service.html">{i18n.t('footer.terms_of_service')}</a>
    </div>
  );
}

