"use strict";(self.webpackChunkclient=self.webpackChunkclient||[]).push([[98],{7098:(e,t,s)=>{s.r(t),s.d(t,{default:()=>m});var a=s(9379),r=s(5043),n=s(5187),l=s(465),d=s(1439),c=s(2339),i=s(579);const o=e=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",minimumFractionDigits:2,maximumFractionDigits:2}).format(e),m=()=>{const{user:e}=(0,n.A)(),[t,s]=(0,r.useState)([]),[m,u]=(0,r.useState)(!0),[x,g]=(0,r.useState)(null),[p,h]=(0,r.useState)(!1),[j,y]=(0,r.useState)(null),[b,f]=(0,r.useState)(""),[N,v]=(0,r.useState)(null),[w,P]=(0,r.useState)({currentPage:1,itemsPerPage:5,totalItems:0}),[_,A]=(0,r.useState)({status:"",dateRange:{from:null,to:null}}),[C,S]=(0,r.useState)({field:"created_at",direction:"desc"});(0,r.useEffect)((()=>{e&&R()}),[e,w.currentPage,w.itemsPerPage,_.status,_.dateRange,C]);const R=async()=>{try{u(!0);const t=(w.currentPage-1)*w.itemsPerPage,r=t+w.itemsPerPage-1;let n=l.N.from("orders").select("\n          id,\n          status,\n          total_amount,\n          shipping_address,\n          city,\n          pincode,\n          mobile,\n          created_at,\n          cancel_reason,\n          cancelled_at,\n          order_items (\n            quantity,\n            price,\n            products (\n              name,\n              image_url\n            )\n          )\n        ",{count:"exact"}).eq("user_id",e.id).order(C.field,{ascending:"asc"===C.direction});_.status&&(n=n.eq("status",_.status)),_.dateRange.from&&(n=n.gte("created_at",_.dateRange.from)),_.dateRange.to&&(n=n.lte("created_at",_.dateRange.to));const{data:d,error:c,count:i}=await n.range(t,r);if(c)throw c;const o=d.map(((e,s)=>(0,a.A)((0,a.A)({},e),{},{serialNo:t+s+1})));s(o),P((e=>(0,a.A)((0,a.A)({},e),{},{totalItems:i||0})))}catch(t){console.error("Error fetching orders:",t),c.Ay.error("Failed to load orders")}finally{u(!1)}},k=e=>new Date(e).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"});return(0,i.jsxs)("div",{className:"min-h-screen bg-gray-50",children:[(0,i.jsx)(d.A,{}),(0,i.jsxs)("div",{className:"max-w-7xl mx-auto px-4 py-16",children:[(0,i.jsxs)("div",{className:"flex justify-between items-center mb-8",children:[(0,i.jsx)("h1",{className:"text-3xl font-bold text-gray-900",children:"My Orders"}),(0,i.jsxs)("div",{className:"flex space-x-4 items-center",children:[(0,i.jsxs)("div",{className:"flex items-center space-x-2",children:[(0,i.jsx)("label",{htmlFor:"itemsPerPage",className:"text-sm text-gray-700",children:"Items per page:"}),(0,i.jsx)("select",{id:"itemsPerPage",value:w.itemsPerPage,onChange:e=>P((t=>(0,a.A)((0,a.A)({},t),{},{itemsPerPage:parseInt(e.target.value),currentPage:1}))),className:"px-3 py-2 border rounded-md text-sm",children:[5,10,20,50].map((e=>(0,i.jsx)("option",{value:e,children:e},e)))})]}),(0,i.jsxs)("select",{value:_.status,onChange:e=>A((t=>(0,a.A)((0,a.A)({},t),{},{status:e.target.value}))),className:"px-3 py-2 border rounded-md",children:[(0,i.jsx)("option",{value:"",children:"All Statuses"}),(0,i.jsx)("option",{value:"pending",children:"Pending"}),(0,i.jsx)("option",{value:"processing",children:"Processing"}),(0,i.jsx)("option",{value:"completed",children:"Completed"}),(0,i.jsx)("option",{value:"cancelled",children:"Cancelled"})]}),(0,i.jsxs)("div",{className:"flex space-x-2",children:[(0,i.jsx)("input",{type:"date",value:_.dateRange.from||"",onChange:e=>A((t=>(0,a.A)((0,a.A)({},t),{},{dateRange:(0,a.A)((0,a.A)({},t.dateRange),{},{from:e.target.value})}))),className:"px-3 py-2 border rounded-md"}),(0,i.jsx)("input",{type:"date",value:_.dateRange.to||"",onChange:e=>A((t=>(0,a.A)((0,a.A)({},t),{},{dateRange:(0,a.A)((0,a.A)({},t.dateRange),{},{to:e.target.value})}))),className:"px-3 py-2 border rounded-md"})]})]})]}),m?(0,i.jsx)("div",{className:"text-center py-12",children:(0,i.jsx)("p",{children:"Loading orders..."})}):0===t.length?(0,i.jsxs)("div",{className:"text-center py-12",children:[(0,i.jsx)("h3",{className:"text-lg font-medium text-gray-900 mb-2",children:"No orders found"}),(0,i.jsx)("p",{className:"text-gray-500",children:_.status||_.dateRange.from||_.dateRange.to?"No orders match your current filters.":"You haven't placed any orders yet."})]}):(0,i.jsx)("div",{className:"space-y-4",children:t.map((e=>{return(0,i.jsxs)("div",{className:"bg-white shadow rounded-lg overflow-hidden",children:[(0,i.jsxs)("div",{className:"p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50",onClick:()=>{return t=e.id,void v((e=>e===t?null:t));var t},children:[(0,i.jsxs)("div",{className:"flex items-center space-x-4",children:[(0,i.jsxs)("span",{className:"text-sm font-medium text-gray-500",children:["SL No: ",e.serialNo]}),(0,i.jsxs)("span",{className:"font-medium text-gray-900",children:["Order #",e.id.slice(0,8)]}),(0,i.jsx)("span",{className:(t=e.status,"px-2 py-1 rounded-full text-xs font-medium ".concat({pending:"bg-yellow-100 text-yellow-800",processing:"bg-blue-100 text-blue-800",completed:"bg-green-100 text-green-800",cancelled:"bg-red-100 text-red-800"}[t]||"bg-gray-100 text-gray-800")),children:e.status})]}),(0,i.jsxs)("div",{className:"flex items-center space-x-4",children:[(0,i.jsx)("span",{className:"text-sm text-gray-500",children:k(e.created_at)}),(0,i.jsx)("span",{className:"font-bold text-gray-900",children:o(e.total_amount)}),(0,i.jsx)("svg",{className:"w-5 h-5 transform transition-transform duration-200 ".concat(N===e.id?"rotate-180":""),fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:(0,i.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 9l-7 7-7-7"})})]})]}),N===e.id&&(0,i.jsxs)("div",{className:"p-4 border-t",children:[(0,i.jsxs)("div",{className:"mb-4",children:[(0,i.jsxs)("div",{className:"flex justify-between items-center mb-2",children:[(0,i.jsx)("h4",{className:"text-lg font-semibold",children:"Order Items"}),"pending"===e.status&&(0,i.jsx)("button",{onClick:()=>(e=>{y(e),h(!0)})(e),disabled:x===e.id,className:"px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 text-sm",children:x===e.id?"Cancelling...":"Cancel Order"})]}),(0,i.jsx)("div",{className:"space-y-2",children:e.order_items.map(((e,t)=>(0,i.jsxs)("div",{className:"flex items-center justify-between border-b pb-2 last:border-b-0",children:[(0,i.jsxs)("div",{className:"flex items-center space-x-4",children:[(0,i.jsx)("img",{src:e.products.image_url,alt:e.products.name,className:"w-16 h-16 object-cover rounded"}),(0,i.jsxs)("div",{children:[(0,i.jsx)("p",{className:"font-medium",children:e.products.name}),(0,i.jsxs)("p",{className:"text-sm text-gray-500",children:["Quantity: ",e.quantity]})]})]}),(0,i.jsx)("span",{className:"font-medium",children:o(e.price*e.quantity)})]},t)))})]}),(0,i.jsxs)("div",{className:"bg-gray-50 p-4 rounded",children:[(0,i.jsx)("h4",{className:"text-lg font-semibold mb-2",children:"Shipping Details"}),(0,i.jsx)("p",{children:e.shipping_address}),(0,i.jsxs)("p",{children:[e.city," - ",e.pincode]}),(0,i.jsxs)("p",{children:["Mobile: ",e.mobile]})]}),"cancelled"===e.status&&e.cancel_reason&&(0,i.jsxs)("div",{className:"mt-4 bg-red-50 p-4 rounded",children:[(0,i.jsx)("h4",{className:"text-lg font-semibold text-red-800 mb-2",children:"Cancellation Details"}),(0,i.jsxs)("p",{className:"text-red-700",children:["Reason: ",e.cancel_reason]}),e.cancelled_at&&(0,i.jsxs)("p",{className:"text-red-700 text-sm",children:["Cancelled on: ",k(e.cancelled_at)]})]})]})]},e.id);var t}))}),(0,i.jsxs)("div",{className:"flex justify-between items-center mt-6",children:[(0,i.jsxs)("div",{className:"text-sm text-gray-700",children:["Showing"," ",(0,i.jsx)("span",{className:"font-medium",children:(w.currentPage-1)*w.itemsPerPage+1})," ","to"," ",(0,i.jsx)("span",{className:"font-medium",children:Math.min(w.currentPage*w.itemsPerPage,w.totalItems)})," ","of"," ",(0,i.jsx)("span",{className:"font-medium",children:w.totalItems})," ","orders"]}),(0,i.jsxs)("div",{className:"flex space-x-2",children:[(0,i.jsx)("button",{onClick:()=>P((e=>(0,a.A)((0,a.A)({},e),{},{currentPage:e.currentPage-1}))),disabled:1===w.currentPage,className:"px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50",children:"Previous"}),(0,i.jsx)("button",{onClick:()=>P((e=>(0,a.A)((0,a.A)({},e),{},{currentPage:e.currentPage+1}))),disabled:w.currentPage>=Math.ceil(w.totalItems/w.itemsPerPage),className:"px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50",children:"Next"})]})]}),p&&(0,i.jsx)("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",children:(0,i.jsxs)("div",{className:"bg-white rounded-lg p-6 max-w-md w-full",children:[(0,i.jsx)("h2",{className:"text-xl font-bold mb-4",children:"Cancel Order"}),(0,i.jsx)("p",{className:"mb-4",children:"Are you sure you want to cancel this order?"}),(0,i.jsx)("textarea",{value:b,onChange:e=>f(e.target.value),placeholder:"Optional: Reason for cancellation",className:"w-full p-2 border rounded mb-4",rows:"3"}),(0,i.jsxs)("div",{className:"flex justify-end space-x-2",children:[(0,i.jsx)("button",{onClick:()=>h(!1),className:"px-4 py-2 bg-gray-200 text-gray-800 rounded",children:"No, Keep Order"}),(0,i.jsx)("button",{onClick:async()=>{if(j)try{g(j.id);const{data:e,error:t}=await l.N.from("orders").select("\n          *,\n          order_items (\n            product_id,\n            quantity,\n            products (name)\n          )\n        ").eq("id",j.id).single();if(t)return console.error("Error fetching order details:",t),void c.Ay.error("Failed to cancel order");if(!["pending","processing"].includes(e.status))return void c.Ay.error("This order cannot be cancelled");const s=e.order_items.map((e=>l.N.rpc("increment_product_stock",{product_id:e.product_id,quantity_to_add:e.quantity})));await Promise.all(s);const{error:a}=await l.N.from("orders").update({status:"cancelled",cancel_reason:b||"Cancelled by customer",cancelled_at:(new Date).toISOString()}).eq("id",j.id);if(a)throw a;await R(),h(!1),f(""),c.Ay.success("Order cancelled successfully")}catch(e){console.error("Order cancellation error:",e),c.Ay.error("Failed to cancel order")}finally{g(null)}},disabled:x===j.id,className:"px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50",children:x===j.id?"Cancelling...":"Yes, Cancel Order"})]})]})})]})]})}}}]);
//# sourceMappingURL=98.80cf39a0.chunk.js.map