type JitsiTokenUser = {
	avatar: string; // URL
	name: string;
	email: string;
};

type JitsiTokenContext = {
	user: JitsiTokenUser;
};

export type JitsiTokenPayload = {
	aud: string; // Application ID
	iss: string; // Issuer
	sub: string; // Subject (Public Host)
	room: string; // Room Name
	exp: number; // Expiration Time
	nbf: number; // Not Before Time
	context: JitsiTokenContext;
};
