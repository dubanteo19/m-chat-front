export enum RoomActivityType {
	BUZZ = 'buzz',
	REVERSE = 'reverse',
	CHEER = 'cheer',
	SPIN = 'spin'
}

export interface RoomActivity<TType extends RoomActivityType> {
	activity: TType;
}

export interface TimedRoomActivity<TType extends RoomActivityType> extends RoomActivity<TType> {
	activityId: string;
	startedAt: number;
}

export interface RoomActivityVariant<TVariant extends string> {
	variant: TVariant;
	weight: number;
	duration: number;
}

export enum SpinMode {
	CLASSIC = 'classic',
	FAKEOUT = 'fakeout',
	REVERSE = 'reverse',
	CARD = 'card',
	GRAVITY = 'gravity'
}

export type SpinDirection = -1 | 1;

export interface SpinActivity extends TimedRoomActivity<RoomActivityType.SPIN> {
	seed: number;
	mode: SpinMode;
	direction: SpinDirection;
}
