import PromptSuggestionButton from "./PromptSuggestionButton";

const PromptSuggestionRow = ({ onPromptClick }) => {
  const suggestions = [
    "What is the best anime of all time?",
    "What are the new anime coming out this year?",
    "Which is the anime with the strawhat pirates?",
    "When is the next season of Black Clover coming out?",
  ];
  return (
    <div className="prompt-suggestion-row">
      {suggestions.map((suggestions, index) => (
        <PromptSuggestionButton
          key={`prompt-suggestion-${index}`}
          text={suggestions}
          onClick={() => onPromptClick(suggestions)}
        />
      ))}
    </div>
  );
};

export default PromptSuggestionRow;
