import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useTranslation } from 'react-i18next';

export default function LangSwitcher() {
  const { t, i18n } = useTranslation(); 
  function changeLang(value) {    
    console.log(value)
    if (value)
        i18n.changeLanguage(value);
  } 

  return (
    
    <div className="">
        <ToggleGroup type="single" defaultValue="en" variant="outline" onValueChange={changeLang}>
            <ToggleGroupItem value="en">EN</ToggleGroupItem>
            <ToggleGroupItem value="fr">FR</ToggleGroupItem>
            <ToggleGroupItem value="ru">RU</ToggleGroupItem>
        </ToggleGroup>
    </div>
  );
}

