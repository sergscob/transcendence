import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from "@/stores/settingsStore";

export default function LangSwitcher() {
  const { i18n } = useTranslation();
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  function changeLang(value) {
    if (!value)
      return;

    setLanguage(value);
    i18n.changeLanguage(value);
  }

  return (
    <div>
        <ToggleGroup type="single" value={language} variant="outline" onValueChange={changeLang}>
            <ToggleGroupItem value="en" className={i18n.language==='en' ? 'bg-gray-300 ' : 'cursor-pointer'}>EN</ToggleGroupItem>
            <ToggleGroupItem value="fr" className={i18n.language==='fr' ? 'bg-gray-300 ' : 'cursor-pointer'}>FR</ToggleGroupItem>
            <ToggleGroupItem value="ru" className={i18n.language==='ru' ? 'bg-gray-300 ' : 'cursor-pointer'}>RU</ToggleGroupItem>
        </ToggleGroup>
    </div>
  );
}

