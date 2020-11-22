import HelloComponent from './HelloComponent.tsx';

export type Props = { name: string };
export default function(this: Ogone<{ message: string; list: string[] }>, props: Props) {
  return <template>
    <HelloComponent name={this.message} >
      {true}
    </HelloComponent>
  </template>
  declare: {
    this.message = 'SRNV';
  }
  connectedCallback: {
    let i = 0;
    setInterval(() => {
      this.message = 'SRNV' + i++;
    });
  }
}