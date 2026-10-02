import React from 'react';

interface Props{children:React.ReactNode}
interface State{hasError:boolean}
export class AppErrorBoundary extends React.Component<Props,State>{
  state:State={hasError:false};
  static getDerivedStateFromError():State{return {hasError:true};}
  componentDidCatch(error:Error){console.warn('[Lina][UI_ERROR]',{name:error.name,message:error.message});}
  render(){
    if(this.state.hasError)return <div className="min-h-screen flex items-center justify-center p-6 bg-stone-50 dark:bg-stone-950"><div className="max-w-md w-full rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 text-center shadow-sm"><div className="text-lg font-bold">Lina đang tạm gián đoạn</div><p className="text-sm text-stone-500 mt-2">Dữ liệu học tập đã lưu trên thiết bị vẫn được giữ nguyên. Bạn có thể tải lại ứng dụng để tiếp tục.</p><button className="mt-4 px-4 py-2 rounded-xl bg-amber-600 text-white font-semibold" onClick={()=>location.reload()}>Tải lại ứng dụng</button></div></div>;
    return this.props.children;
  }
}
