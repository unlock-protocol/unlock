export type Size = 'small' | 'medium' | 'large'
export type SizeStyleProp = Partial<Record<Size, string>>
export type State = "error" | "success"
export type StateStyleProp = Partial<Record<State, string>>