import React, { useMemo, useState } from 'react';
import { ButtonGroup, Button, Box } from '@rocket.chat/fuselage';

import Page from '../components/basic/Page';
import AccountProfileForm from './AccountProfileForm';
import { useTranslation } from '../contexts/TranslationContext';
import { useForm } from '../hooks/useForm';
import { useSetting } from '../contexts/SettingsContext';
import { useUser } from '../contexts/UserContext';

const saveChanges = () => { console.log('Saved'); };

const getInitialValues = (user) => ({
	realname: user.name ?? '',
	email: user.email ?? '',
	username: user.username ?? '',
	password: '',
	confirmationPassword: '',
	avatar: '',
	url: user.avatarUrl ?? '',
	statusText: user.statusText ?? '',
	statusType: user.status ?? '',
	bio: user.bio ?? '',
});

const AccountProfilePage = (props) => {
	const t = useTranslation();

	const user = useUser();

	const { values, handlers, hasUnsavedChanges } = useForm(getInitialValues(user));
	const [canSave, setCanSave] = useState(true);

	console.log({
		user,
		values,
		handlers,
		hasUnsavedChanges,
	});

	const allowRealNameChange = useSetting('Accounts_AllowRealNameChange');
	const allowUserStatusMessageChange = useSetting('Accounts_AllowUserStatusMessageChange');
	const allowUsernameChange = useSetting('Accounts_AllowUsernameChange');
	const allowEmailChange = useSetting('Accounts_AllowEmailChange');
	const allowPasswordChange = useSetting('Accounts_AllowPasswordChange');
	const allowUserAvatarChange = useSetting('Accounts_AllowUserAvatarChange');
	const allowDeleteOwnAccount = useSetting('Accounts_AllowDeleteOwnAccount');
	const ldapEnabled = useSetting('LDAP_Enable');
	const requireName = useSetting('Accounts_RequireNameForSignUp');
	const namesRegexSetting = useSetting('UTF8_Names_Validation');

	const namesRegex = useMemo(() => new RegExp(`^${ namesRegexSetting }$`), [namesRegexSetting]);

	const canChangeUsername = allowUsernameChange && !ldapEnabled;

	const settings = useMemo(() => ({
		allowRealNameChange,
		allowUserStatusMessageChange,
		allowEmailChange,
		allowPasswordChange,
		allowUserAvatarChange,
		allowDeleteOwnAccount,
		canChangeUsername,
		requireName,
		namesRegex,
	}), [
		allowDeleteOwnAccount,
		allowEmailChange,
		allowPasswordChange,
		allowRealNameChange,
		allowUserAvatarChange,
		allowUserStatusMessageChange,
		canChangeUsername,
		requireName,
		namesRegex,
	]);

	return <Page {...props}>
		<Page.Header title={t('Profile')}>
			<ButtonGroup>
				<Button primary disabled={!hasUnsavedChanges && !canSave} onClick={saveChanges}>
					{t('Save_changes')}
				</Button>
			</ButtonGroup>
		</Page.Header>
		<Page.ScrollableContent>
			<Box maxWidth='x600' w='full' alignSelf='center'>
				<AccountProfileForm values={values} handlers={handlers} user={user} settings={settings} setCanSave={setCanSave}/>
			</Box>
		</Page.ScrollableContent>
	</Page>;
};

export default AccountProfilePage;
