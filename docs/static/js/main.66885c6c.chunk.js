(window.webpackJsonp=window.webpackJsonp||[]).push([[0],[,,,,,,,,function(e,t,a){e.exports=a(17)},,,,,,function(e,t,a){},function(e,t,a){},function(e,t,a){},function(e,t,a){"use strict";a.r(t);var n=a(0),r=a.n(n),u=a(4),o=a.n(u),s=(a(14),a(15),a(6)),c=a(5),l=a(7),i=a(1),m=a(2);a(16);function d(){return(d=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var a=arguments[t];for(var n in a)Object.prototype.hasOwnProperty.call(a,n)&&(e[n]=a[n])}return e}).apply(this,arguments)}function f(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},u=Object.keys(e);for(n=0;n<u.length;n++)a=u[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var u=Object.getOwnPropertySymbols(e);for(n=0;n<u.length;n++)a=u[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var h=r.a.createElement("path",{d:"M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"}),v=r.a.createElement("line",{x1:18,y1:9,x2:12,y2:15}),b=r.a.createElement("line",{x1:12,y1:9,x2:18,y2:15}),k=function(e){var t=e.svgRef,a=f(e,["svgRef"]);return r.a.createElement("svg",d({width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round",className:"feather feather-delete",ref:t},a),h,v,b)},p=r.a.forwardRef(function(e,t){return r.a.createElement(k,d({svgRef:t},e))}),y=(a.p,window.sudoku),w=["easy","medium","hard","very-hard","insane","inhuman"];var E=function(){function e(){var t=this,a=arguments.length>0&&void 0!==arguments[0]?arguments[0]:w[1],n=arguments.length>1?arguments[1]:void 0;Object(i.a)(this,e),n?Object.getOwnPropertyNames(n).forEach(function(e){t[e]=n[e]}):(this.difficulty=a,this.initialBoard=this.board=y.generate(a))}return Object(m.a)(e,[{key:"solve",value:function(e){return y.solve(e||this.initialBoard)}},{key:"isSolved",value:function(){return this.solve(this.board)===this.board}},{key:"hasError",value:function(){return!this.solve(this.board)}},{key:"getCells",value:function(){var e=Array.from(this.initialBoard);return Array.from(this.board).map(function(t,a){return{hint:"."!==e[a],value:"."===t?"":t,row:Math.floor(a/9),column:a%9,index:a}})}},{key:"clone",value:function(t){return new e(null,Object.assign({},this.toHash(),t))}},{key:"toHash",value:function(){var e=this,t={};return Object.getOwnPropertyNames(this).forEach(function(a){t[a]=e[a]}),t}},{key:"updateCell",value:function(e,t){if(this.getCells()[e].hint)return this;var a=""===t?".":t,n=this.board.substring(0,e)+a+this.board.substring(e+1);return this.clone({board:n})}}]),e}();var N=function(e){function t(e){var a;return Object(i.a)(this,t),(a=Object(s.a)(this,Object(c.a)(t).call(this,e))).onKeyDown=function(e){switch(e.key){case"ArrowUp":a.setState({cursor:(81+a.state.cursor-9)%81});break;case"ArrowDown":a.setState({cursor:(81+a.state.cursor+9)%81});break;case"ArrowLeft":a.setState({cursor:(81+a.state.cursor-1)%81});break;case"ArrowRight":a.setState({cursor:(81+a.state.cursor+1)%81});break;case"Backspace":case"1":case"2":case"3":case"4":case"5":case"6":case"7":case"8":case"9":var t="Backspace"===e.key?"":e.key;a.updateValue(t)}},a.clearCursor=function(){a.setState({cursor:null})},a.solve=function(){a.setState({sudoku:a.state.sudoku.clone({board:a.state.sudoku.solve()})})},a.newGame=function(){a.setState({sudoku:new E,cursor:null})},a.state={sudoku:new E,cursor:null},a}return Object(l.a)(t,e),Object(m.a)(t,[{key:"updateValue",value:function(e){this.state.cursor&&this.setState({sudoku:this.state.sudoku.updateCell(this.state.cursor,e)})}},{key:"updateCursor",value:function(e){this.setState({cursor:e.index})}},{key:"render",value:function(){var e=this,t=function(e){for(var t=[],a=0;a<9;a++)t.push(e.slice(9*a,9*(a+1)));return t}(this.state.sudoku.getCells());return r.a.createElement("div",null,r.a.createElement("div",{className:"Game",tabIndex:"0",onKeyDown:this.onKeyDown},r.a.createElement("table",{className:"Game__Table"},r.a.createElement("tbody",null,t.map(function(t,a){return r.a.createElement("tr",{key:a,className:"Game__TableRow"},t.map(function(t){var a={"data-selected":e.state.cursor===t.index,onClick:function(){return e.updateCursor(t)}};return r.a.createElement("td",Object.assign({className:"Game__Cell",key:t.index,"data-hint":t.hint},a),t.value)}))})))),this.state.sudoku.isSolved()&&r.a.createElement("h2",null,"Complete!"),r.a.createElement("div",{className:"Game__Numpad"},r.a.createElement("div",{className:"Game__NumButtonContainer"},r.a.createElement("button",{className:"Game__NumButton",onClick:function(){return e.updateValue("1")}},"1"),r.a.createElement("button",{className:"Game__NumButton",onClick:function(){return e.updateValue("2")}},"2"),r.a.createElement("button",{className:"Game__NumButton",onClick:function(){return e.updateValue("3")}},"3"),r.a.createElement("button",{className:"Game__NumButton",onClick:function(){return e.updateValue("4")}},"4"),r.a.createElement("button",{className:"Game__NumButton",onClick:function(){return e.updateValue("5")}},"5"),r.a.createElement("button",{className:"Game__NumButton",onClick:function(){return e.updateValue("6")}},"6"),r.a.createElement("button",{className:"Game__NumButton",onClick:function(){return e.updateValue("7")}},"7"),r.a.createElement("button",{className:"Game__NumButton",onClick:function(){return e.updateValue("8")}},"8"),r.a.createElement("button",{className:"Game__NumButton",onClick:function(){return e.updateValue("9")}},"9"),r.a.createElement("div",{className:"Game__NumButton"}),r.a.createElement("button",{className:"Game__NumButton",onClick:function(){return e.updateValue("")}},r.a.createElement("span",null,r.a.createElement(p,null))),r.a.createElement("div",{className:"Game__NumButton"}))),r.a.createElement("div",{className:"Game__ButtonBar"},r.a.createElement("button",{onClick:this.solve},"Solve"),r.a.createElement("button",{onClick:this.newGame},"New Game")))}}]),t}(r.a.Component);var _=function(){return r.a.createElement("div",{className:"App"},r.a.createElement(N,null))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));o.a.render(r.a.createElement(_,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})}],[[8,1,2]]]);
//# sourceMappingURL=main.66885c6c.chunk.js.map