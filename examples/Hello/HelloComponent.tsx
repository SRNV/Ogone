interface Props {
  name: string | null;
}
export default function(this: Ogone<{ message: string }>, props: Props) {
  declare: () => {
    this.message = 'World';
    this.message = 'Test 2';
  }
  return <template>
    <div>
      Hello {props.name || this.message}
    </div>
  </template>
}