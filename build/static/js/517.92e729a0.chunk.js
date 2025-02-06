"use strict";(self.webpackChunkclient=self.webpackChunkclient||[]).push([[517],{9332:(e,s,a)=>{a.d(s,{A:()=>l});a(5043);var t=a(3216),r=a(5475),n=a(579);const l=e=>{let{children:s}=e;const a=(0,t.zy)(),l=[{path:"/admin",name:"Dashboard",icon:(0,n.jsx)("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,n.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"})})},{path:"/admin/orders",name:"Orders",icon:(0,n.jsx)("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,n.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"})})},{path:"/admin/products",name:"Products",icon:(0,n.jsx)("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,n.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"})})},{path:"/admin/users",name:"Users",icon:(0,n.jsx)("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,n.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"})})},{path:"/admin/sales-dashboard",name:"Sales Dashboard",icon:(0,n.jsx)("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,n.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M11 11V7a4 4 0 118 0v4m-1 4h-6m6 0a2 2 0 11-4 0m4 0a2 2 0 11-4 0m-4 0H5m6 0a2 2 0 11-4 0m4 0a2 2 0 11-4 0"})})}];return(0,n.jsxs)("div",{className:"min-h-screen bg-gray-100 flex",children:[(0,n.jsxs)("div",{className:"w-64 bg-white shadow-lg",children:[(0,n.jsx)("div",{className:"h-16 bg-green-700 flex items-center px-6",children:(0,n.jsx)("span",{className:"text-white text-lg font-semibold",children:"Admin Panel"})}),(0,n.jsxs)("nav",{className:"mt-6",children:[l.map((e=>(0,n.jsxs)(r.N_,{to:e.path,className:"flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ".concat(a.pathname===e.path?"bg-gray-100 border-r-4 border-green-700":""),children:[e.icon,(0,n.jsx)("span",{className:"mx-3",children:e.name})]},e.path))),(0,n.jsxs)(r.N_,{to:"/",className:"flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 mt-4",children:[(0,n.jsx)("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,n.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M10 19l-7-7m0 0l7-7m-7 7h18"})}),(0,n.jsx)("span",{className:"mx-3",children:"Back to Site"})]})]})]}),(0,n.jsxs)("div",{className:"flex-1",children:[(0,n.jsxs)("div",{className:"bg-white shadow-sm h-16 flex items-center px-8",children:[(0,n.jsx)("div",{className:"flex-1"}),(0,n.jsx)("div",{className:"flex items-center space-x-4",children:(0,n.jsx)("span",{className:"text-gray-700",children:"Admin"})})]}),(0,n.jsx)("div",{className:"p-8",children:s})]})]})}},3517:(e,s,a)=>{a.r(s),a.d(s,{default:()=>i});var t=a(5043),r=a(465),n=a(2378),l=a(7762),c=(a(557),a(1238)),o=a(9332),d=a(579);const i=()=>{const[e,s]=(0,t.useState)([]),[a,i]=(0,t.useState)(!0);(0,t.useEffect)((()=>{h()}),[]);const h=async()=>{try{i(!0);const{data:e,error:a}=await r.N.from("orders").select("*").eq("status","Delivered");if(a)throw a;s(e)}catch(e){console.error("Error fetching sales data:",e)}finally{i(!1)}};return(0,d.jsx)(o.A,{children:(0,d.jsxs)("div",{className:"min-h-screen bg-gray-100 p-6",children:[(0,d.jsx)("h1",{className:"text-3xl font-bold mb-6",children:"Sales Dashboard"}),a?(0,d.jsx)("div",{children:"Loading..."}):(0,d.jsxs)("div",{children:[(0,d.jsxs)("div",{className:"mb-4",children:[(0,d.jsxs)("h2",{className:"text-xl font-semibold",children:["Total Sales: \u20b9",e.reduce(((e,s)=>e+s.amount),0)]}),(0,d.jsxs)("h2",{className:"text-xl font-semibold",children:["Total Orders: ",e.length]})]}),(0,d.jsxs)("div",{className:"mb-4",children:[(0,d.jsx)("h2",{className:"text-xl font-semibold",children:"Best Selling Products"}),(0,d.jsx)("ul",{children:(()=>{const s={};e.forEach((e=>{s[e.product_id]||(s[e.product_id]=0),s[e.product_id]+=e.amount}));return Object.entries(s).sort(((e,s)=>s[1]-e[1])).slice(0,5)})().map(((e,s)=>(0,d.jsxs)("li",{children:["Product ID: ",e[0],", Sales: \u20b9",e[1]]},s)))})]}),(0,d.jsxs)("table",{className:"min-w-full bg-white",children:[(0,d.jsx)("thead",{children:(0,d.jsxs)("tr",{children:[(0,d.jsx)("th",{className:"py-2",children:"ID"}),(0,d.jsx)("th",{className:"py-2",children:"Product ID"}),(0,d.jsx)("th",{className:"py-2",children:"Amount"}),(0,d.jsx)("th",{className:"py-2",children:"Date"})]})}),(0,d.jsx)("tbody",{children:e.map(((e,s)=>(0,d.jsxs)("tr",{className:"text-center",children:[(0,d.jsx)("td",{className:"py-2",children:e.id}),(0,d.jsx)("td",{className:"py-2",children:e.product_id}),(0,d.jsxs)("td",{className:"py-2",children:["\u20b9",e.amount]}),(0,d.jsx)("td",{className:"py-2",children:new Date(e.date).toLocaleDateString()})]},s)))})]}),(0,d.jsxs)("div",{className:"mt-4",children:[(0,d.jsx)(n.CSVLink,{data:e,filename:"sales_report.csv",className:"bg-green-600 text-white py-2 px-4 rounded mr-2",children:"Export as CSV"}),(0,d.jsx)("button",{onClick:()=>{const s=c.Wp.json_to_sheet(e),a=c.Wp.book_new();c.Wp.book_append_sheet(a,s,"Sales Report"),c._h(a,"sales_report.xlsx")},className:"bg-blue-600 text-white py-2 px-4 rounded mr-2",children:"Export as Excel"}),(0,d.jsx)("button",{onClick:()=>{const s=new l.jsPDF;s.text("Sales Report",20,10),s.autoTable({head:[["ID","Product ID","Amount","Date"]],body:e.map((e=>[e.id,e.product_id,e.amount,e.date]))}),s.save("sales_report.pdf")},className:"bg-red-600 text-white py-2 px-4 rounded",children:"Export as PDF"})]})]})]})})}}}]);
//# sourceMappingURL=517.92e729a0.chunk.js.map