try:
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas
    from reportlab.platypus import SimpleDocTemplate, Paragraph
    from reportlab.lib.styles import getSampleStyleSheet
    from PIL import Image
    import io

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer)
    styles = getSampleStyleSheet()
    story = [Paragraph("Hello World", styles['Normal'])]
    doc.build(story)
    print("PDF Generation Test: SUCCESS")
except Exception as e:
    print(f"PDF Generation Test: FAILED - {e}")
    import traceback
    traceback.print_exc()
