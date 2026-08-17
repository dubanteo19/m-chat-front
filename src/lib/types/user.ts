export type TitleStyle = {
    textColor: string;
    backgroundColor: string;
    borderRadius: string;
    borderStyle?: string;
    borderColor?: string;
    textEffect?: string;
    animationVibe?: string;
};

export type UserInfo = {
    username: string;
    displayName: string;
    avatarUrl: string | null;
    title: string | null;
    titleStyle: TitleStyle;
};
