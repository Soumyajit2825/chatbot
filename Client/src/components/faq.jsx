import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';
import { faqs } from './data';

export default function FAQ() {
  return (
    <Accordion type="single" collapsible>
      {faqs.map((faq, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger>{faq.question}</AccordionTrigger>
          <AccordionContent>{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}