Vue.component('componentauserinput',{
    props:['createcoption','query','checkuserinput'],
    template:
    `
        <form>

            <div class='formgroup'>
                <span> Currency: </span>
                <label>
                <select v-html='createcoption' name="cone" v-model='query.cone'>
                </select>
                 vs.
                <select v-html='createcoption' name="ctwo" v-model='query.ctwo'>
                </select>
                </label>
            </div>

            <div class='formgroup'>
                <label for="df">From: <input type="date" name='df' v-model='query.df'></label>
                
                <label for="dt"> to: <input type="date" name='dt' v-model='query.dt'></label>
                
            </div>

            <button @click.prevent='checkuserinput'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M23.111 20.058l-4.977-4.977c.965-1.52 1.523-3.322 1.523-5.251 0-5.42-4.409-9.83-9.829-9.83-5.42 0-9.828 4.41-9.828 9.83s4.408 9.83 9.829 9.83c1.834 0 3.552-.505 5.022-1.383l5.021 5.021c2.144 2.141 5.384-1.096 3.239-3.24zm-20.064-10.228c0-3.739 3.043-6.782 6.782-6.782s6.782 3.042 6.782 6.782-3.043 6.782-6.782 6.782-6.782-3.043-6.782-6.782zm2.01-1.764c1.984-4.599 8.664-4.066 9.922.749-2.534-2.974-6.993-3.294-9.922-.749z"/></svg></button>

        </form>
    `
});
Vue.component('componentbresultarea',{
    props:['labels','data'],
    template:
    `
        <section>
            <div class='resultcontainer'>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>FX Rate</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for='(l, idx) in labels'>
                        <th >{{l}}</th>
                        <td v-text='data[idx]'></td>
                    </tr>
                </tbody>
            </table>
        </section>
    `
});
new Vue({
    el:'#root',
    data:{
        coption:[],
        query:{
            df:'',
            dt:'',
            cone:'',
            ctwo:''
        },
        labels:[],
        data:[],
        flag:false
    },
    methods:{
        checkuserinput(){
            let d = new Date();
            if (this.query.dt > this.query.df && this.query.dt <= d.toISOString().slice(0, 10) && this.query.cone && this.query.ctwo) {
                this.getresult();
            }
            else {
                alert('Input is invalid, please check.');
            }
        },
        showresult(){
            let canvas = document.createElement('canvas');
            canvas.setAttribute('id','queryresult');
            document.querySelector('.resultcontainer').appendChild(canvas);
            
            new Chart(document.getElementById('queryresult'), {
                type:'line',
                data:{
                    labels:this.labels,
                    datasets:[{
                        data:this.data,
                        label: this.query.cone + ' / ' + this.query.ctwo,
                        borderColor: "#3e95cd",
                        fill: false,
                        lineTension:0
                    }]
                },
                options:{
                    title: {
                        display: true,
                        text: this.query.cone + ' / ' + this.query.ctwo
                    },
                    legend:{
                        display:false
                    }
                }
            })

        },
        getresult(){
            if (document.querySelector('.chartjs-size-monitor')){
                document.querySelector('.chartjs-size-monitor').remove();
                document.getElementById('queryresult').remove();
            }

            this.labels.length = 0;
            this.data.length = 0;
            this.flag = true;

            url = 'https://api.exchangeratesapi.io/history?start_at=' + this.query.df + '&end_at=' + this.query.dt + '&base=' + this.query.cone + '&symbols=' + this.query.ctwo;
            fetch(url)
            .then(res => res.json())
            .then(rr => 
            {
                orderrate = Object.entries(rr.rates).sort().reduce((o,[k,v]) => (o[k] = v,o), {} );
                Object.keys(orderrate).forEach(cur => {
                    this.labels.push(cur);
                    this.data.push(rr.rates[cur][this.query.ctwo].toFixed(2));
                });
            });

            this.showresult();
        },
    },
    computed: {
        createcoption(){
            return this.coption.sort().map(v => `<option>${v}</options>`).join('');
        }
    },
    mounted: function(){
        fetch('https://api.exchangeratesapi.io/latest?base=USD')
        .then(res => res.json())
        .then(rr => Object.keys(rr.rates).forEach(cur => this.coption.push(cur)));
    }
});