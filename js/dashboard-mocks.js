// All records on this page are synthetic examples, never client or county data.
(() => {
    const root = document.getElementById("dashboardMock");
    const params = new URLSearchParams(location.search);
    let view = ["county", "luthra", "freight"].includes(params.get("view")) ? params.get("view") : "county";
    let period = ["Q1", "Q2"].includes(params.get("period")) ? params.get("period") : "all";
    let datasets;
    const esc = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
    const number = value => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
    const percent = value => `${value.toFixed(1)}%`;
    const money = value => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
    const sum = (rows, key) => rows.reduce((total, row) => total + row[key], 0);
    const selectedRows = () => datasets[view].rows.filter(row => period === "all" || row.period === period);

    function render() {
        const data = datasets[view];
        const rows = selectedRows();
        const freight = view === "freight";
        const groups = [...new Set(rows.map(row => row.group))].map(group => {
            const selected = rows.filter(row => row.group === group);
            if (freight) {
                const revenue = sum(selected, "revenue");
                const cost = sum(selected, "cost");
                return { group, revenue, cost, receivables: sum(selected, "receivables"), overdue: sum(selected, "overdue"), rate: (revenue - cost) / revenue * 100 };
            }
            const volume = sum(selected, "volume");
            const completed = sum(selected, "completed");
            return { group, volume, completed, rate: completed / volume * 100, time: selected.reduce((total, row) => total + row.time * row.volume, 0) / volume };
        });
        const revenue = freight ? sum(rows, "revenue") : 0;
        const volume = freight ? 0 : sum(rows, "volume");
        const metrics = freight ? [
            ["Revenue", money(revenue)],
            ["Job margin", percent((revenue - sum(rows, "cost")) / revenue * 100)],
            ["Overdue receivables", money(sum(rows, "overdue"))]
        ] : [
            ["Requests", number(volume)],
            ["Completion", percent(sum(rows, "completed") / volume * 100)],
            ["Mean turnaround", `${(rows.reduce((total, row) => total + row.volume * row.time, 0) / volume).toFixed(1)} ${data.unit}`]
        ];
        const columns = freight ? [data.groupLabel, "Revenue", "Cost", "Job margin", "Receivables", "Overdue"]
            : [data.groupLabel, "Requests", "Completed", "Completion", `Mean ${data.unit}`];
        root.innerHTML = `<div class="mock-heading"><div><p class="mock-context">${esc(data.context)}</p><h2>${esc(data.title)}</h2><p>${esc(data.description)}</p></div>
            <label class="mock-period">Sample period<select id="mockPeriod"><option value="all">Q1 + Q2</option><option value="Q1">Q1</option><option value="Q2">Q2</option></select></label></div>
            <dl class="mock-metrics">${metrics.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("")}</dl>
            <div class="mock-chart"><h3>${esc(data.chartLabel)}</h3><p>Percent · 0–100</p><div class="mock-bars" aria-hidden="true">${groups.map(group => `<div class="mock-bar-row"><span>${esc(group.group)}</span><div class="mock-bar-track"><span style="width:${group.rate}%"></span></div><strong>${percent(group.rate)}</strong></div>`).join("")}</div></div>
            <div class="mock-table-scroll"><table><caption>Sample records aggregated by ${esc(data.groupLabel.toLowerCase())} · ${period === "all" ? "Q1 + Q2" : period}</caption><thead><tr>${columns.map(label => `<th scope="col">${esc(label)}</th>`).join("")}</tr></thead><tbody>${groups.map(group => `<tr><th scope="row">${esc(group.group)}</th>${(freight ? [money(group.revenue), money(group.cost), percent(group.rate), money(group.receivables), money(group.overdue)] : [number(group.volume), number(group.completed), percent(group.rate), group.time.toFixed(1)]).map(value => `<td>${value}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
            <div class="mock-foot"><p>${freight ? "Job margin = (revenue − cost) / revenue. USD amounts are fictional." : "Completion = completed / requests. Mean turnaround is weighted by request count."} These samples demonstrate the reporting layout; they do not measure actual performance.</p><a href="${esc(data.researchUrl)}">Related work</a><button type="button" id="downloadMock">Download sample CSV</button></div>`;
        document.getElementById("mockPeriod").value = period;
        document.getElementById("mockPeriod").addEventListener("change", event => { period = event.target.value; update(); });
        document.getElementById("downloadMock").addEventListener("click", download);
        document.querySelectorAll("[data-mock-view]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.mockView === view)));
        document.getElementById("mockStatus").textContent = `${data.title}, ${period === "all" ? "Q1 and Q2" : period} sample data`;
    }
    function update() {
        const url = new URL(location.href);
        url.searchParams.set("view", view);
        if (period === "all") url.searchParams.delete("period"); else url.searchParams.set("period", period);
        history.replaceState({}, "", url);
        render();
    }
    function download() {
        const rows = selectedRows();
        const columns = Object.keys(rows[0]);
        const csv = ["data_kind," + columns.join(","), ...rows.map(row => "illustrative_sample," + columns.map(key => JSON.stringify(row[key])).join(","))].join("\r\n");
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
        const link = document.createElement("a");
        link.href = url; link.download = `${view}-illustrative-sample-${period}.csv`; link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    async function load() {
        try {
            const response = await fetch("/data/dashboard_mocks.json");
            if (!response.ok) throw new Error("Sample data unavailable");
            datasets = await response.json();
            document.querySelectorAll("[data-mock-view]").forEach(button => {
                button.disabled = false;
                button.addEventListener("click", () => { view = button.dataset.mockView; update(); });
            });
            render();
        } catch (_) {
            root.innerHTML = '<p>The sample dashboard could not load. <button type="button" id="retryMock">Try again</button></p>';
            document.getElementById("retryMock").addEventListener("click", load);
        }
    }
    load();
})();
