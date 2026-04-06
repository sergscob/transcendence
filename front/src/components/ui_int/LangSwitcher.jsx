import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useTranslation } from 'react-i18next';

export default function LangSwitcher() {
  const { t, i18n } = useTranslation(); 

  function changeLang(value) {    
    if (value)
        i18n.changeLanguage(value);
  }

  return (
    <div>
        <ToggleGroup type="single" defaultValue="en" variant="outline" onValueChange={changeLang}>
            <ToggleGroupItem value="en" className={i18n.language==='en' ? 'bg-gray-300 ' : 'cursor-pointer'}>EN</ToggleGroupItem>
            <ToggleGroupItem value="fr" className={i18n.language==='fr' ? 'bg-gray-300 ' : 'cursor-pointer'}>FR</ToggleGroupItem>
            <ToggleGroupItem value="ru" className={i18n.language==='ru' ? 'bg-gray-300 ' : 'cursor-pointer'}>RU</ToggleGroupItem>
        </ToggleGroup>
    </div>
  );
}

