import PyPDF2
import sys

pdf_path = 'provincial_deca_plus.pdf'

with open(pdf_path, 'rb') as pdf_file:
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    total_pages = len(pdf_reader.pages)
    
    print(f"Total pages in PDF: {total_pages}\n")
    
    # Extract all pages
    for page_num in range(total_pages):
        page = pdf_reader.pages[page_num]
        text = page.extract_text()
        print(f"\n{'='*80}")
        print(f"PAGE {page_num + 1}")
        print('='*80)
        print(text)
