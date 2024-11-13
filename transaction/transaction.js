$(document).ready(function() {
  let transactions = []; // Liste pour stocker les transactions
  let currentBalance = 1200; // Exemple de solde initial (peut être mis à jour depuis le backend)

  // Fonction pour récupérer les transactions depuis le backend
  function fetchTransactions() {
    $.ajax({
      url: 'http://localhost:8080/api/transactions', // URL de l'API Java
      method: 'GET',
      dataType: 'json',
      success: function(data) {
        transactions = data; // Mettre à jour la liste des transactions
        displayTransactions(transactions); // Afficher les transactions
      },
      error: function() {
        alert('Erreur lors de la récupération des transactions.');
      }
    });
  }

  // Fonction pour afficher les transactions dans le tableau
  function displayTransactions(filteredTransactions) {
    const tableBody = $('#transaction-body');
    const noTransactionsMessage = $('#no-transactions-message');
    tableBody.empty();

    if (filteredTransactions.length === 0) {
      noTransactionsMessage.show(); // Afficher le message si aucune transaction n'est trouvée
    } else {
      noTransactionsMessage.hide();
      filteredTransactions.forEach(transaction => {
        const row = `
          <tr>
            <td>${transaction.date}</td>
            <td>${transaction.type}</td>
            <td>${transaction.montant} €</td>
            <td>${transaction.solde} €</td>
          </tr>
        `;
        tableBody.append(row); // Ajouter la ligne au tableau
      });
    }
  }

  // Fonction pour ajouter une transaction via le backend
  function addTransaction(event) {
    event.preventDefault();

    // Récupérer les valeurs du formulaire
    const type = $('#transaction-type').val();
    const montant = parseFloat($('#transaction-amount').val());
    const date = $('#transaction-date').val();

    if (type === 'retrait' && montant > currentBalance) {
      $('#transaction-error').show(); // Afficher une erreur si le solde est insuffisant
      return;
    } else {
      $('#transaction-error').hide(); // Cacher le message d'erreur
    }

    // Préparer les données de la transaction
    const transaction = {
      date: date,
      type: type,
      montant: montant
    };

    // Requête Ajax pour envoyer la nouvelle transaction au backend
    $.ajax({
      url: 'http://localhost:8080/api/transactions',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(transaction), // Convertir l'objet en JSON
      success: function(newTransaction) {
        currentBalance = newTransaction.solde; // Mettre à jour le solde actuel
        transactions.push(newTransaction); // Ajouter la nouvelle transaction à la liste
        displayTransactions(transactions); // Afficher les transactions mises à jour
      },
      error: function() {
        alert('Erreur lors de l\'ajout de la transaction.');
      }
    });
  }

  // Fonction pour appliquer le filtre de période
  function applyPeriodFilter() {
    const period = parseInt($('#filter-period').val());
    const currentDate = new Date();
    const startDate = new Date();
    startDate.setDate(currentDate.getDate() - period);

    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= currentDate;
    });

    displayTransactions(filteredTransactions);
  }

  // Fonction pour télécharger l'historique des transactions en fichier CSV
  function downloadCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Type,Montant,Solde après transaction\n";

    transactions.forEach(transaction => {
      const row = `${transaction.date},${transaction.type},${transaction.montant},${transaction.solde}`;
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "historique_transactions.csv");
    document.body.appendChild(link);
    link.click(); // Simuler un clic pour démarrer le téléchargement
    document.body.removeChild(link);
  }

  // Associer les événements de soumission du formulaire et des boutons
  $('#transaction-form').on('submit', addTransaction); // Ajouter une transaction
  $('#apply-period-filter').on('click', applyPeriodFilter); // Appliquer le filtre de période
  $('#download-csv').on('click', downloadCSV); // Télécharger l'historique en CSV

  // Récupérer les transactions au chargement de la page
  fetchTransactions();
});
