import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  businessDetails: {
    flexDirection: 'column',
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  invoiceTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981', // emerald-500
    textAlign: 'right',
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  billTo: {
    flexDirection: 'column',
  },
  billToTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 4,
  },
  clientName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  clientText: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 2,
  },
  meta: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
    width: 80,
    textAlign: 'right',
    marginRight: 8,
  },
  metaValue: {
    fontSize: 12,
    color: '#111827',
    width: 80,
    textAlign: 'right',
  },
  table: {
    width: '100%',
    marginBottom: 40,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 8,
  },
  tableCell: {
    fontSize: 12,
    color: '#111827',
  },
  colDesc: { width: '40%' },
  colQty: { width: '20%', textAlign: 'right' },
  colPrice: { width: '20%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },
  summary: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginBottom: 40,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    width: 100,
    textAlign: 'right',
    marginRight: 8,
  },
  summaryValue: {
    fontSize: 12,
    color: '#111827',
    width: 80,
    textAlign: 'right',
  },
  summaryTotalRow: {
    flexDirection: 'row',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  summaryTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    width: 100,
    textAlign: 'right',
    marginRight: 8,
  },
  summaryTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
    width: 80,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'column',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 20,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: '#4b5563',
  },
  paymentButton: {
    marginTop: 40,
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 6,
    textAlign: 'center',
    width: 200,
    alignSelf: 'center',
  },
  paymentButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textDecoration: 'none',
  }
});

interface InvoicePDFProps {
  invoice: any;
  paymentUrl: string;
}

export function InvoicePDF({ invoice, paymentUrl }: InvoicePDFProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.businessDetails}>
            <Text style={styles.businessName}>{invoice.businesses.name}</Text>
            {invoice.businesses.website && (
              <Text style={styles.clientText}>{invoice.businesses.website}</Text>
            )}
          </View>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <View style={styles.billTo}>
            <Text style={styles.billToTitle}>BILL TO</Text>
            <Text style={styles.clientName}>{invoice.clients.name}</Text>
            {invoice.clients.email && <Text style={styles.clientText}>{invoice.clients.email}</Text>}
            {invoice.clients.address && <Text style={styles.clientText}>{invoice.clients.address}</Text>}
          </View>

          <View style={styles.meta}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Invoice #:</Text>
              <Text style={styles.metaValue}>{invoice.invoice_number}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Issue Date:</Text>
              <Text style={styles.metaValue}>{formatDate(invoice.issue_date)}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Due Date:</Text>
              <Text style={styles.metaValue}>{formatDate(invoice.due_date)}</Text>
            </View>
          </View>
        </View>

        {/* Line Items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Quantity</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>Price</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Amount</Text>
          </View>
          
          {invoice.invoice_items.map((item: any, i: number) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colDesc]}>{item.description}</Text>
              <Text style={[styles.tableCell, styles.colQty]}>{Number(item.quantity).toString()}</Text>
              <Text style={[styles.tableCell, styles.colPrice]}>{formatCurrency(Number(item.unit_price))}</Text>
              <Text style={[styles.tableCell, styles.colTotal]}>{formatCurrency(Number(item.total))}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(Number(invoice.subtotal))}</Text>
          </View>
          {Number(invoice.tax) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(Number(invoice.tax))}</Text>
            </View>
          )}
          {Number(invoice.discount) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount:</Text>
              <Text style={styles.summaryValue}>-{formatCurrency(Number(invoice.discount))}</Text>
            </View>
          )}
          <View style={styles.summaryTotalRow}>
            <Text style={styles.summaryTotalLabel}>Total Due:</Text>
            <Text style={styles.summaryTotalValue}>{formatCurrency(Number(invoice.total))}</Text>
          </View>
        </View>

        {/* Payment Link & Notes */}
        <View style={styles.footer}>
          {invoice.notes && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.notesTitle}>NOTES</Text>
              <Text style={styles.notesText}>{invoice.notes}</Text>
            </View>
          )}

          {invoice.status !== 'paid' && paymentUrl && (
            <View style={styles.paymentButton}>
              <Link src={paymentUrl} style={styles.paymentButtonText}>
                Pay Invoice Online
              </Link>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}
