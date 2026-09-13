'use client'
export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){return <main className="route-state" role="alert"><h1>We couldn’t load this page</h1><p>Your information is safe. Try the request again, or return later if the problem continues.</p><button onClick={reset}>Try again</button></main>}
