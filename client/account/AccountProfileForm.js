import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { Field, FieldGroup, TextInput, TextAreaInput, Box, Icon, AnimatedVisibility, PasswordInput } from '@rocket.chat/fuselage';
import { useDebouncedCallback, useDebouncedValue } from '@rocket.chat/fuselage-hooks';

import { useTranslation } from '../contexts/TranslationContext';
import { isEmail } from '../../app/utils/lib/isEmail.js';
import { useMethod } from '../contexts/ServerContext';
import { UserAvatarEditor } from '../components/basic/avatar/UserAvatarEditor';
// import CustomFieldsForm from './CustomFieldsForm';

export default function AccountProfileForm({ values, handlers, user, settings, setCanSave, ...props }) {
	const t = useTranslation();

	const checkUsernameAvailability = useMethod('checkUsernameAvailability');
	const [usernameError, setUsernameError] = useState();

	const {
		allowRealNameChange,
		allowUserStatusMessageChange,
		allowEmailChange,
		allowPasswordChange,
		allowUserAvatarChange,
		canChangeUsername,
		namesRegex,
		requireName,
	} = settings;

	const {
		realname,
		email,
		username,
		password,
		confirmationPassword,
		statusText,
		// statusType,
		bio,
	} = values;

	const {
		handleRealname,
		handleEmail,
		handleUsername,
		handlePassword,
		handleConfirmationPassword,
		handleAvatar,
		handleStatusText,
		// handleStatusType,
		handleBio,
	} = handlers;

	useEffect(() => {
		if (!password) {
			handleConfirmationPassword('');
		}
	}, [password, handleConfirmationPassword]);

	const passwordError = useMemo(() => (!password || !confirmationPassword || password === confirmationPassword ? undefined : t('Passwords_do_not_match')), [t, password, confirmationPassword]);
	const emailError = useMemo(() => (isEmail(email) ? undefined : 'error'), [email]);
	const checkUsername = useDebouncedCallback(async (username) => {
		if (user.username === username) { return setUsernameError(undefined); }
		if (!namesRegex.test(username)) { return setUsernameError(t('error-invalid-username')); }
		const isAvailable = await checkUsernameAvailability(username);
		console.log(isAvailable);
		if (!isAvailable) { return setUsernameError(t('Username_already_exist')); }
	}, 400, [namesRegex, t, user.username, checkUsernameAvailability, setUsernameError]);

	useEffect(() => {
		checkUsername(username);
	}, [checkUsername, username]);

	const nameError = useMemo(() => {
		if (user.name === realname) { return undefined; }
		if (!namesRegex.test(realname)) { return t('error-invalid-name'); }
		if (!realname && requireName) { return t('Field_required'); }
	}, [namesRegex, realname, requireName, t, user.name]);

	const statusTextError = useMemo(() => (!statusText || statusText.length <= 120 || statusText.length === 0 ? undefined : t('Max_length_is', '120')), [statusText, t]);
	const { emails: [{ verified = false }] } = user;

	const canSave = !![
		!!passwordError,
		!!emailError,
		!!usernameError,
		!!nameError,
		!!statusTextError,
	].filter(Boolean);

	useEffect(() => {
		setCanSave(canSave);
	}, [canSave, setCanSave]);

	return <FieldGroup is='form' onSubmit={useCallback((e) => e.preventDefault(), [])} { ...props }>
		{useMemo(() => <Field>
			<UserAvatarEditor username={username} setAvatarObj={handleAvatar} disabled={!allowUserAvatarChange}/>
		</Field>, [username, handleAvatar, allowUserAvatarChange])}
		<Box display='flex' flexDirection='row' justifyContent='space-between'>
			{useMemo(() => <Field mie='x8' justifyContent='flex-start'>
				<Field.Label>{t('Name')}</Field.Label>
				<Field.Row>
					<TextInput error={nameError} disabled={!allowRealNameChange} flexGrow={1} value={realname} onChange={handleRealname}/>
				</Field.Row>
				<Field.Error>
					{nameError}
				</Field.Error>
			</Field>, [t, realname, handleRealname, allowRealNameChange, nameError])}
			{useMemo(() => <Field mis='x8' justifyContent='flex-start'>
				<Field.Label>{t('Username')}</Field.Label>
				<Field.Row>
					<TextInput error={usernameError} disabled={!canChangeUsername} flexGrow={1} value={username} onChange={handleUsername} addon={<Icon name='at' size='x20'/>}/>
				</Field.Row>
				<Field.Error>
					{usernameError}
				</Field.Error>
			</Field>, [t, username, handleUsername, canChangeUsername, usernameError])}
		</Box>
		{useMemo(() => <Field>
			<Field.Label>{t('StatusMessage')}</Field.Label>
			<Field.Row>
				<TextInput error={statusTextError} disabled={!allowUserStatusMessageChange} flexGrow={1} value={statusText} onChange={handleStatusText} addon={<Icon name='edit' size='x20'/>}/>
			</Field.Row>
			<Field.Error>
				{statusTextError}
			</Field.Error>
		</Field>, [t, statusTextError, allowUserStatusMessageChange, statusText, handleStatusText])}
		{useMemo(() => <Field>
			<Field.Label>{t('Bio')}</Field.Label>
			<Field.Row>
				<TextAreaInput rows={3} flexGrow={1} value={bio} onChange={handleBio} addon={<Icon name='edit' size='x20' alignSelf='center'/>}/>
			</Field.Row>
		</Field>, [bio, handleBio, t])}
		<Box display='flex' flexDirection='row' justifyContent='space-between' alignItems='flex-start'>
			{useMemo(() => <Field mie='x8' flexGrow={1}>
				<Field.Label>{t('Email')}</Field.Label>
				<Field.Row>
					<TextInput
						flexGrow={1}
						value={email}
						error={emailError}
						onChange={handleEmail}
						addon={
							<Icon name={ verified ? 'circle-check' : 'mail' } size='x20'/>
						}
						disabled={!allowEmailChange}
					/>
				</Field.Row>
			</Field>, [t, email, handleEmail, verified, allowEmailChange, emailError])}
			<Box display='flex' flexDirection='column' flexGrow={1} flexShrink={0} mis='x8'>
				{useMemo(() => <Field flexGrow={1}>
					<Field.Label>{t('Password')}</Field.Label>
					<Field.Row>
						<PasswordInput disabled={!allowPasswordChange} error={passwordError} flexGrow={1} value={password} onChange={handlePassword} addon={<Icon name='key' size='x20'/>}/>
					</Field.Row>
				</Field>, [t, password, handlePassword, passwordError, allowPasswordChange])}
				{useMemo(() => <AnimatedVisibility visibility={password ? AnimatedVisibility.VISIBLE : AnimatedVisibility.HIDDEN }><Field>
					<Field.Label>{t('Password')}</Field.Label>
					<Field.Row>
						<PasswordInput error={passwordError} flexGrow={1} value={confirmationPassword} onChange={handleConfirmationPassword} addon={<Icon name='key' size='x20'/>}/>
					</Field.Row>
					<Field.Error>
						{passwordError}
					</Field.Error>
				</Field></AnimatedVisibility>, [t, confirmationPassword, handleConfirmationPassword, password, passwordError])}
			</Box>
		</Box>
		{/* <CustomFieldsForm customFieldsData={customFields} setCustomFieldsData={handleCustomFields}/> */}
	</FieldGroup>;
}
