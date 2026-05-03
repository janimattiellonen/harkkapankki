import * as stylex from '@stylexjs/stylex';
import { fontWeight } from '~/styles/constants.stylex';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/Button';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher">
      <Button
        variant="ghost"
        onClick={() => changeLanguage('fi')}
        style={i18n.language === 'fi' && styles.active}
      >
        FI
      </Button>
      <Button
        variant="ghost"
        onClick={() => changeLanguage('en')}
        style={i18n.language === 'en' && styles.active}
      >
        EN
      </Button>
    </div>
  );
}

const styles = stylex.create({
  active: {
    fontWeight: fontWeight.bold,
    textDecorationLine: 'underline',
  },
});
